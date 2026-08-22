import { useNavigate } from 'react-router-dom';

import type { Tema } from '@adivimat/shared';

interface ThemeListProps {
  themes: Tema[];
  onSelectTheme: (tema: Tema) => void;
}

function ThemeList({ themes, onSelectTheme }: ThemeListProps) {
  const navigate = useNavigate();

  return (
    <section>
      <h2>Temas</h2>
      {/* El boton de anadir estaba dentro del map, asi que se repetia una vez
          por tema y desaparecia por completo cuando la lista estaba vacia. */}
      <button onClick={() => navigate('/temas/nuevo')}>Anadir tema</button>
      <ul>
        {themes.map((theme) => (
          <li key={theme.id}>
            {/* Antes el <li> entero tenia el onClick y los botones quedaban
                dentro: pulsar "Editar" tambien seleccionaba el tema. */}
            <button onClick={() => onSelectTheme(theme)}>{theme.tema}</button>
            <button onClick={() => navigate(`/temas/${theme.id}/editar`)}>Editar el tema</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ThemeList;
