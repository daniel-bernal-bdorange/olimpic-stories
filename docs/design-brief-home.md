# UX BRIEF — HOME PAGE
## Olympic Data Stories · Página de inicio

---

## CONCEPTO DE INTERACCIÓN (inspirado en obys.agency)

La página es una sola pantalla sin scroll convencional. A la izquierda, una lista
vertical de los 4 capítulos. A la derecha, una imagen a pantalla completa que
cambia al hacer hover o al scrollear sobre cada ítem de la lista. La descripción
de cada capítulo aparece con una animación de texto al activar cada ítem.

**Referencia de interacción exacta:** en obys.agency la lista de proyectos está
a la izquierda y al pasar el cursor (o scrollear) sobre cada nombre, la imagen
de la derecha hace un clip-path reveal desde el centro. Se adopta ese mismo
mecanismo aquí.

**Tono visual:** material deportivo de alta gama. La referencia mental es el
catálogo de S-Works de Specialized, o la web de Völkl skis, o HEAD Tennis:
fondos negros o blancos puros, fotografía de producto con mucho contraste,
tipografía sans-serif condensada, detalles dorados como los herrajes de lujo.
Elegancia contenida, nunca recargada.

---

## LAYOUT GLOBAL

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (fixed, 60px)                                        │
│  Logo izq · · · · · · · · · · · · · · · · ·  nav der        │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                       │
│   LISTA DE           │   IMAGEN ACTIVA                       │
│   CAPÍTULOS          │   (full bleed, ocupa todo el resto)   │
│   (izquierda, 38%)   │   (derecha, 62%)                      │
│                      │                                       │
│                      │                                       │
│                      │                                       │
│                      │                                       │
├──────────────────────┴──────────────────────────────────────┤
│  FOOTER (fixed, 40px)  año · contador de historias · crédito│
└─────────────────────────────────────────────────────────────┘
```

Todo encaja en 100vh. No hay scroll de página — el scroll del usuario
activa el cambio entre capítulos (mediante WheelEvent o scroll snapping
en un contenedor overflow:hidden).

---

## HEADER (fixed, altura 60px)

- **Izquierda:** logotipo textual — `ODS` en Bebas Neue 1.4rem --white,
  seguido de `·` y `OLYMPIC DATA STORIES` en DM Mono 0.65rem --muted.
  Separados por un punto dorado.
- **Centro:** vacío — el espacio vacío es parte del diseño
- **Derecha:** los 5 aros olímpicos en SVG, 18px de diámetro, en sus
  colores reales, opacity 0.5. Al hover sobre el logotipo izquierdo
  suben a opacity 1 con transición 0.4s.
- Separado del contenido por una línea `1px solid --gray` en la parte inferior.
- Fondo: `rgba(10,10,10,0.92)` con `backdrop-filter: blur(8px)`.

---

## COLUMNA IZQUIERDA — Lista de capítulos (38% del ancho)

### Estructura de cada ítem de la lista

```
[número]   [título]
           [categoría]
           ─────────────── (línea que se anima al activarse)
           [descripción corta — solo visible cuando está activo]
           [CTA — solo visible cuando está activo]
```

**Espaciado:** cada ítem ocupa aprox. el 22% de la altura disponible.
Separados por líneas `1px solid --gray` que aparecen al hacer scroll.

### Contenido de cada ítem

```
01   COLD WAR IN GOLD
     DATA STORY · 1952–2020
     ────────────────────────────────────
     Dos superpotencias. Una sola tabla de clasificación.
     Cómo la Guerra Fría se libró en los marcadores olímpicos.
     → EXPLORE STORY

02   BODY ATLAS
     DATA STORY · 15 SPORTS
     ────────────────────────────────────
     El deporte que practicas moldea el cuerpo que tienes.
     28 centímetros separan al gimnasta del jugador de baloncesto.
     → EXPLORE STORY

03   LOST SPORTS
     DATA STORY · 1900–1936
     ────────────────────────────────────
     Cricket, soga, polo, pelota vasca. Nueve deportes
     que los Juegos Olímpicos olvidaron para siempre.
     → EXPLORE STORY

04   ONE LIFE, TEN GAMES
     DATA STORY · 1964–2012
     ────────────────────────────────────
     Un jinete canadiense compitió en diez Olimpiadas durante
     cuarenta años. Estas son las vidas más largas del deporte.
     → EXPLORE STORY
```

### Estados de cada ítem

**Estado INACTIVO:**
- Número: DM Mono 0.75rem, --muted
- Título: Bebas Neue 3.5vw, `#555555` (gris oscuro)
- Categoría: DM Mono 0.65rem, --muted
- Descripción y CTA: `opacity: 0`, `height: 0`, `overflow: hidden`
- Línea horizontal: `width: 0%`

**Estado ACTIVO (hover o scroll sobre él):**
- Número: DM Mono 0.75rem, --gold (cambia de color)
- Título: Bebas Neue 3.5vw, --white (se ilumina)
- Categoría: DM Mono 0.65rem, --gold-light
- Descripción: `opacity: 1`, entra con clip-path reveal de abajo a arriba (0.5s)
- Línea: `width: 100%`, color --gold, transición 0.6s ease-out
- CTA `→ EXPLORE STORY`: aparece con fade, DM Mono 0.8rem --white,
  con `→` en --gold que se desplaza +4px a la derecha al hover
- El ítem activo tiene a su izquierda una barra vertical `3px solid --gold`
  que aparece con scale(0→1) desde arriba

**Transición entre ítems:** 0.3s ease. El ítem que se desactiva colapsa
primero (0.2s) y luego se activa el nuevo (0.15s de delay).

---

## COLUMNA DERECHA — Imagen activa (62% del ancho)

### Comportamiento base

- La imagen ocupa el 100% de este panel (`object-fit: cover`)
- Al cambiar de ítem activo: la nueva imagen hace un **clip-path reveal**
  desde el centro hacia afuera: `circle(0% at 50% 50%) → circle(150% at 50% 50%)`
  Duración: 0.7s, easing: `cubic-bezier(0.77, 0, 0.175, 1)`
- Sobre la imagen, overlay de gradiente:
  `linear-gradient(to right, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0) 60%)`
  para que el texto de la izquierda sea legible si hay sangrado visual.

### Overlay de datos (esquina inferior derecha de la imagen)

Cuando un ítem está activo, aparece un pequeño bloque de datos flotante
en la esquina inferior derecha de la imagen (fondo semitransparente oscuro,
padding 16px, borde izquierdo 2px --gold):

```
COLD WAR IN GOLD        ← DM Mono 0.65rem --gold uppercase
─────────────────
68 YEARS OF DATA        ← Bebas Neue 1.8rem --white
16 OLYMPIC GAMES        ← DM Mono 0.75rem --muted
2 SUPERPOWERS           ← DM Mono 0.75rem --muted
```

Cada story tiene sus propios datos de contexto (ver abajo).

### Datos de contexto por story

```js
const storyMeta = [
  {
    id: "cold-war",
    label: "COLD WAR IN GOLD",
    stats: ["68 YEARS OF DATA", "16 OLYMPIC GAMES", "2 SUPERPOWERS"],
    accentColor: "--ring-red",        // el acento del overlay usa el rojo
  },
  {
    id: "body-atlas",
    label: "BODY ATLAS",
    stats: ["15 SPORTS ANALYZED", "100K+ ATHLETES", "28CM DIFFERENCE"],
    accentColor: "--ring-blue",
  },
  {
    id: "lost-sports",
    label: "LOST SPORTS",
    stats: ["9 FORGOTTEN SPORTS", "1900 — 1936", "GBR DOMINATED ALL"],
    accentColor: "--ring-green",
  },
  {
    id: "one-life",
    label: "ONE LIFE, TEN GAMES",
    stats: ["10 OLYMPIC GAMES", "40 YEARS COMPETING", "6 EXTRAORDINARY LIVES"],
    accentColor: "--ring-yellow",
  },
];
```

### Imágenes necesarias (ver documento de generación)

```
/assets/img/
├── hero-bg.jpg          ← imagen de fondo antes de activar ningún ítem
├── story-01-coldwar.jpg ← Cold War in Gold
├── story-02-body.jpg    ← Body Atlas
├── story-03-lost.jpg    ← Lost Sports
└── story-04-life.jpg    ← One Life, Ten Games
```

Todas en formato landscape, mínimo 1400×900px, fondo oscuro preferiblemente.

---

## HERO BG (estado inicial, antes de interactuar)

Antes de que el usuario haga hover o scroll sobre ningún ítem, la columna
derecha muestra la imagen `hero-bg.jpg` con este overlay de texto centrado:

```
OLYMPIC                ← Bebas Neue 7vw --white
DATA STORIES           ← Bebas Neue 7vw --gold

────────────────────── ← línea 1px --gray, 120px de ancho, centrada

Four stories.          ← Cormorant Garamond italic 1.1rem --muted
128 years of data.
Hover to explore.
```

El texto desaparece en cuanto se activa el primer ítem (fade out 0.3s).

---

## FOOTER (fixed, altura 40px)

Línea de texto en DM Mono 0.65rem centrada:

```
[izquierda] 1896 — 2024          [centro] 4 DATA STORIES          [derecha] ↓ SCROLL TO NAVIGATE
```

Todo en --muted. La flecha `↓` hace una animación de bounce vertical (2s infinite).
Separado del contenido por una línea `1px solid --gray` en la parte superior.

---

## INTERACCIÓN DE SCROLL

El scroll del usuario (wheelEvent) navega entre los 4 ítems como si fueran
slides. Cada "tick" de scroll activa el ítem siguiente o anterior.

```js
// Pseudocódigo de la lógica
let activeIndex = -1; // -1 = estado inicial, ninguno activo

window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0 && activeIndex < 3) activeIndex++;
  if (e.deltaY < 0 && activeIndex > -1) activeIndex--;
  updateActiveItem(activeIndex);
});

// También funciona con hover directo sobre los ítems de la lista
listItems.forEach((item, i) => {
  item.addEventListener('mouseenter', () => {
    activeIndex = i;
    updateActiveItem(i);
  });
});
```

En móvil: el scroll natural de la página activa cada ítem al llegar a su
posición (IntersectionObserver, threshold 0.5). El layout cambia a columna
única — imagen arriba (50vh), lista abajo (50vh).

---

## CURSOR PERSONALIZADO

- Círculo de 20px, borde `1.5px solid --gold`, fondo transparente
- Cuando está sobre un ítem de la lista: se rellena de dorado y escala a 1.4x
- Cuando está sobre el CTA `→ EXPLORE`: se transforma en un óvalo horizontal
  con el texto `GO` en DM Mono 0.6rem centrado
- Transición de todas las transformaciones: 0.2s ease
- El cursor nativo se oculta con `cursor: none` en todo el documento

---

## ANIMACIÓN DE ENTRADA (page load)

Secuencia al cargar la página por primera vez:

```
0.0s  — fondo negro, nada visible
0.2s  — el header aparece con fade (0.4s)
0.6s  — la línea del footer sube desde abajo (translateY 20px → 0, 0.4s)
0.8s  — los números 01–04 aparecen uno a uno con stagger 0.1s (solo números)
1.2s  — los títulos de cada ítem se revelan con clip-path de abajo a arriba, stagger 0.08s
1.6s  — la imagen hero-bg aparece con fade (0.6s) en la columna derecha
2.2s  — el texto hero central ("Olympic Data Stories / Four stories...") fade in
```

---

## SISTEMA DE NAVEGACIÓN (páginas internas)

Al hacer click en `→ EXPLORE STORY` de cualquier ítem:

1. La imagen activa hace un **scale up** suave (`scale(1) → scale(1.04)`, 0.3s)
2. La columna izquierda desaparece con `translateX(-100%)` (0.4s)
3. La imagen hace un **full bleed** al 100% del viewport (0.5s)
4. Fade out a negro (0.3s)
5. Navegación a la página correspondiente: `/cold-war`, `/body-atlas`, etc.

Esta transición se implementa con GSAP y la URL cambia con `history.pushState`
para evitar el parpadeo de recarga completa.

---

## ARCHIVOS A CREAR

```
home/
├── index.html
├── style.css        ← variables (importar del sistema global) + estilos home
└── home.js          ← lógica de interacción: scroll, hover, cursor, transiciones
```

---

## PROMPT INICIAL PARA CURSOR

> "Implementa el home de Olympic Data Stories según este brief. El archivo es
> index.html (todo en un solo archivo: HTML + CSS en `<style>` + JS en `<script>`).
> Empieza por el layout base (header fixed + dos columnas + footer fixed),
> después el sistema de cursor personalizado, después la lógica de activación
> de ítems por hover y scroll, y finalmente las transiciones de imagen.
> Usa GSAP desde CDN para las animaciones. Las imágenes son placeholders por ahora:
> usa fondos de color oscuro con texto centrado indicando el nombre de la imagen."
