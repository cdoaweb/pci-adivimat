"""Convierte el PDF de ADIVIMAT en el JSON de temas/subtemas/adivinanzas.

El libro numera las 304 adivinanzas de forma correlativa y el indice da el rango
de cada seccion, asi que la clasificacion sale del indice en lugar de intentar
reconocer las cabeceras del cuerpo, que aparecen con acentuacion inconsistente
por la codificacion de fuentes del PDF.

Uso:
    python parse_adivimat.py advm.txt adivinanzas.json
donde advm.txt lo genera:
    pdftotext -layout -enc UTF-8 advm.pdf advm.txt
"""

import io
import json
import re
import sys
import unicodedata

TXT = sys.argv[1]
SALIDA = sys.argv[2]

# (tema, subtema, primera, ultima). Tomado del indice del libro.
# Los temas sin subdivisiones reciben un unico subtema "Generalidades" para
# encajar en la jerarquia tema -> subtema -> adivinanza del modelo.
INDICE = [
    ('Geometria del plano', 'Generalidades', 1, 10),
    ('Geometria del plano', 'Angulos', 11, 32),
    ('Geometria del plano', 'Poligonos', 33, 73),
    ('Geometria del plano', 'Circunferencias y circulos', 74, 99),
    ('Geometria del plano', 'Transformaciones en el plano', 100, 118),
    ('Geometria del espacio', 'Generalidades', 119, 135),
    ('Geometria del espacio', 'Poliedros', 136, 158),
    ('Geometria del espacio', 'Cuerpos redondos', 159, 173),
    ('Aritmetica', 'Generalidades', 174, 190),
    ('Leyes de composicion interna', 'Generalidades', 191, 198),
    ('Estructuras algebraicas', 'Generalidades', 199, 211),
    ('Algebra clasica', 'Generalidades', 212, 237),
    ('Funciones reales de variable real', 'Generalidades', 238, 249),
    ('Funciones reales de variable real', 'Sucesiones', 250, 254),
    ('Funciones reales de variable real', 'Elementos de una funcion', 255, 269),
    ('Funciones reales de variable real', 'Clasificacion', 270, 293),
    ('Funciones reales de variable real', 'Funciones relevantes', 294, 304),
]

TOTAL = 304

# Lineas del PDF que no pertenecen a ninguna adivinanza (portada y pie final).
PIE = re.compile(r'^\s*\(?\s*borrador\b|^\s*Madrid,', re.IGNORECASE)

texto = io.open(TXT, encoding='utf-8').read()
lineas = [l for l in texto.split('\n') if not PIE.match(l)]

# El bloque de respuestas empieza en la ultima aparicion de "RESPUESTAS":
# la primera es la entrada del indice.
corte = max(i for i, l in enumerate(lineas) if l.strip() == 'RESPUESTAS')
cuerpo, respuestas_txt = lineas[:corte], lineas[corte:]

MARCADOR = re.compile(r'^\s*(\*?)\s*(\d{1,3})\s+(.*)$')


def es_cabecera(linea):
    """Cabeceras de seccion: en mayusculas y sin numero al principio."""
    s = linea.strip()
    if not s or MARCADOR.match(s):
        return False
    letras = [c for c in s if c.isalpha()]
    if not letras:
        return True  # numeros romanos sueltos, lineas decorativas
    return sum(1 for c in letras if c.isupper()) / len(letras) > 0.6


def extraer_numerados(lineas_fuente):
    """Agrupa el texto por numero de adivinanza."""
    items, actual, buffer = {}, None, []

    def volcar():
        if actual is not None:
            items[actual] = '\n'.join(buffer).strip()

    for linea in lineas_fuente:
        m = MARCADOR.match(linea)
        # Un marcador solo vale si abre el numero siguiente al ultimo visto.
        # Asi las cifras que aparecen dentro del verso no se confunden con el
        # comienzo de otra adivinanza.
        if m and int(m.group(2)) == (1 if actual is None else actual + 1):
            volcar()
            actual = int(m.group(2))
            buffer = [m.group(3).strip()]
            continue

        if actual is None or es_cabecera(linea):
            continue
        if linea.strip():
            buffer.append(linea.strip())

    volcar()
    return items


# El libro marca con asterisco las adivinanzas mas exigentes.
destacadas = {
    int(m.group(1))
    for m in (re.match(r'^\s*\*\s*(\d{1,3})\s', l) for l in cuerpo)
    if m
}

preguntas = extraer_numerados(cuerpo)
respuestas = extraer_numerados(respuestas_txt)

faltan = [
    n for n in range(1, TOTAL + 1) if not preguntas.get(n) or not respuestas.get(n)
]
if faltan:
    print('AVISO, sin extraer:', faltan[:20])


def sin_tildes(s):
    return ''.join(
        c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn'
    )


def normalizar(s):
    """Misma normalizacion que aplica el juego al comparar."""
    return sin_tildes(' '.join(s.split()).lower())


def limpiar_pregunta(s):
    # El salto de linea es significativo: las adivinanzas estan en verso.
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip())


def partir_respuesta(bruto):
    """Separa la respuesta corta del matiz entre parentesis.

    El libro escribe cosas como "mediatriz de un segmento (como eje de
    simetria)": el parentesis explica que aspecto del concepto pregunta la
    adivinanza. Nadie va a teclear eso, asi que se guarda como pista.
    """
    s = ' '.join(bruto.split()).strip().rstrip('.')
    m = re.match(r'^(.*?)\s*\((.*)\)\s*$', s)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return s, ''


def acortar(respuesta):
    """Version corta de una respuesta larga, o None si no la tiene.

    "mediatriz de un segmento" -> "mediatriz". Las variaciones de numero y de
    tildes NO se generan aqui: las resuelve la normalizacion al comparar, que
    es mas fiable que fabricar plurales a mano.
    """
    base = ' '.join(respuesta.split()).lower()
    trozos = re.split(r'\s+(?:de|del|de la|de los|en|por|respecto|sobre)\s+', base, maxsplit=1)
    if len(trozos) < 2:
        return None

    corto = trozos[0].strip().rstrip(',')
    if not (1 <= len(corto.split()) <= 3) or len(corto) <= 3:
        return None
    return corto


# --- Primera pasada: respuesta canonica y candidata a forma corta -----------
registros = []
for tema, subtema, ini, fin in INDICE:
    for n in range(ini, fin + 1):
        pregunta = limpiar_pregunta(preguntas.get(n, ''))
        respuesta, matiz = partir_respuesta(respuestas.get(n, ''))
        if not pregunta or not respuesta:
            continue
        registros.append(
            {
                'tema': tema,
                'subtema': subtema,
                'numero': n,
                'pregunta': pregunta,
                'respuesta': respuesta,
                'corto': acortar(respuesta),
                'pista': matiz,
                'dificultad': 'avanzada' if n in destacadas else 'basica',
            }
        )

# --- Segunda pasada: descartar formas cortas ambiguas -----------------------
# Una forma corta solo sirve si identifica una unica adivinanza. "limite por la
# izquierda..." y "limite por la derecha..." se acortarian ambas a "limite", y
# "conjunto de vectores linealmente dependientes/independientes" a "conjunto":
# aceptar eso convertiria respuestas distintas en indistinguibles.
# Se cuentan RESPUESTAS CANONICAS distintas por forma corta, no adivinanzas.
# La 9 y la 10 comparten respuesta ("mediatriz de un segmento") y solo cambia el
# matiz, asi que ambas acortan a "mediatriz" sin ambiguedad alguna. En cambio la
# 272 y la 273 son respuestas distintas ("limite por la izquierda" / "por la
# derecha") que acortarian igual: ahi si se pierde la diferencia.
frecuencia = {}
for r in registros:
    if r['corto']:
        frecuencia.setdefault(normalizar(r['corto']), set()).add(normalizar(r['respuesta']))

descartadas = 0
for r in registros:
    aceptadas = [r['respuesta'].lower()]
    corto = r['corto']
    if corto:
        clave = normalizar(corto)
        # Solo se descarta si DOS adivinanzas distintas se acortarian igual: ahi
        # el complemento era lo que las distinguia ("limite por la izquierda" y
        # "limite por la derecha"), y aceptar "limite" borraria esa diferencia.
        #
        # Que la forma corta coincida con la respuesta exacta de OTRA adivinanza
        # no es problema: cada adivinanza se corrige por separado, y el libro ya
        # repite respuestas ("bisectriz" es la solucion de tres).
        if len(frecuencia[clave]) > 1:
            descartadas += 1
        else:
            aceptadas.append(corto)
    r['respuestasAceptadas'] = sorted(set(aceptadas))
    del r['corto']

# --- Salida en la jerarquia del modelo -------------------------------------
temas, orden = {}, []
for r in registros:
    if r['tema'] not in temas:
        temas[r['tema']] = {}
        orden.append(r['tema'])
    temas[r['tema']].setdefault(r['subtema'], []).append(
        {
            'numero': r['numero'],
            'pregunta': r['pregunta'],
            'respuesta': r['respuesta'],
            'respuestasAceptadas': r['respuestasAceptadas'],
            'pista': r['pista'],
            'dificultad': r['dificultad'],
            # Las que el autor marco como exigentes dan mas margen.
            'intentos': 7 if r['dificultad'] == 'avanzada' else 5,
        }
    )

salida = [
    {'tema': t, 'subtemas': [{'name': s, 'adivinanzas': a} for s, a in temas[t].items()]}
    for t in orden
]

io.open(SALIDA, 'w', encoding='utf-8').write(
    json.dumps(salida, ensure_ascii=False, indent=2) + '\n'
)

total = sum(len(s['adivinanzas']) for t in salida for s in t['subtemas'])
print('temas:', len(salida))
print('subtemas:', sum(len(t['subtemas']) for t in salida))
print('adivinanzas:', total, 'de', TOTAL)
print('avanzadas (marcadas con * por el autor):', len(destacadas))
print('con pista del libro:', sum(1 for r in registros if r['pista']))
print('con forma corta aceptada:', sum(1 for r in registros if len(r['respuestasAceptadas']) > 1))
print('formas cortas descartadas por ambiguas:', descartadas)
