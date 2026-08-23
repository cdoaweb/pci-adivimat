import { useId, useState } from 'react';

import type { OpcionRespuesta } from '@adivimat/shared';

/**
 * Respuesta por eleccion multiple.
 *
 * Se usa un grupo de radios y no una lista de botones que respondan al pulsar:
 * con un lector de pantalla, los radios permiten recorrer las opciones con las
 * flechas y oir todas antes de comprometerse, mientras que un boton que
 * responde al primer clic no da marcha atras.
 */
interface RespuestaOpcionesProps {
  opciones: OpcionRespuesta[];
  /** Opciones ya elegidas y falladas: se dejan visibles pero inservibles. */
  descartadas: ReadonlySet<string>;
  bloqueado: boolean;
  onResponder: (texto: string) => void;
}

function RespuestaOpciones({
  opciones,
  descartadas,
  bloqueado,
  onResponder,
}: RespuestaOpcionesProps) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  /* useId evita que dos grupos coexistentes compartan el atributo name. */
  const grupo = useId();

  const enviar = () => {
    if (!seleccion || bloqueado) return;
    onResponder(seleccion);
    setSeleccion(null);
  };

  return (
    <div>
      <fieldset disabled={bloqueado}>
        <legend>Elige la respuesta</legend>

        {opciones.map((opcion, indice) => {
          const descartada = descartadas.has(opcion.texto);
          const id = `${grupo}-${indice}`;

          return (
            <div key={opcion.texto}>
              <input
                type="radio"
                id={id}
                name={grupo}
                value={opcion.texto}
                checked={seleccion === opcion.texto}
                disabled={descartada}
                onChange={() => setSeleccion(opcion.texto)}
              />
              <label htmlFor={id} style={descartada ? { textDecoration: 'line-through' } : undefined}>
                {opcion.texto}
                {/* El tachado es visual; el texto oculto lo hace audible. */}
                {descartada && <span className="sr-only"> (descartada)</span>}
              </label>
            </div>
          );
        })}
      </fieldset>

      <button onClick={enviar} disabled={bloqueado || !seleccion}>
        Responder
      </button>
    </div>
  );
}

export default RespuestaOpciones;
