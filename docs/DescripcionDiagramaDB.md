\pagebreak

# Diagrama de la base de datos

![Diagrama Entidad Relación](Diagrama%20entidad%20relación.png)

```plantuml
@startuml Diagrama entidad relación

entity Tema {
    +id: int
    +tema: string
}

entity Subtema {
    +name: string
}

entity Adivinanza {
    +id: int
    +pregunta: string
    +respuesta: string
}

Tema ||--o Subtema : tiene
Subtema ||--o Adivinanza : tiene

@enduml
```

## Entidades
- **Tema**
- **Subtema**
- **Adivinanza**

## Atributos
- **Tema**: id, tema
- **Subtema**: name
- **Adivinanza**: id, pregunta, respuesta

## Relaciones
- Un **Tema** puede tener múltiples **Subtemas**.
- Un **Subtema** puede tener múltiples **Adivinanzas**.

## Descripción de las relaciones:
- Un **Tema** tiene una relación uno a muchos con **Subtema**.
- Un **Subtema** tiene una relación uno a muchos con **Adivinanza**.

\pagebreak