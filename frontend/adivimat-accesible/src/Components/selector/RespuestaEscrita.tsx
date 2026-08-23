import { type KeyboardEvent, useState } from 'react';

/**
 * Respuesta escrita a mano.
 *
 * La correccion no exige literalidad: perdona mayusculas, tildes, puntuacion,
 * el articulo inicial y el numero. De eso se encarga `esRespuestaCorrecta` en
 * `@adivimat/shared`.
 */
interface RespuestaEscritaProps {
  bloqueado: boolean;
  onResponder: (texto: string) => void;
}

function RespuestaEscrita({ bloqueado, onResponder }: RespuestaEscritaProps) {
  const [valor, setValor] = useState('');

  const enviar = () => {
    if (!valor.trim() || bloqueado) return;
    onResponder(valor);
    setValor('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div>
      <label htmlFor="respuesta-usuario">Escribe tu respuesta</label>
      <input
        id="respuesta-usuario"
        type="text"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={bloqueado}
        placeholder="Ingrese su respuesta"
        autoComplete="off"
      />
      <button onClick={enviar} disabled={bloqueado || !valor.trim()}>
        Responder
      </button>
    </div>
  );
}

export default RespuestaEscrita;
