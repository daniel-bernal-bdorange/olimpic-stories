# BRIEF — COLD WAR IN GOLD
## Página interior · Olympic Data Stories
### Stack: Next.js (shell) + Vanilla JS + D3.js v7 + GSAP 3 + CSS Custom Properties

---

## DECISIONES DE ARQUITECTURA (2026-04-27)

### Arquitectura híbrida — por qué

El proyecto usa Next.js con App Router para el shell global (home, routing,
transiciones cinematográficas entre historias). Las páginas de historia usan
Vanilla JS + D3 + GSAP directamente, sin React en la capa de visualización.

**Razón técnica**: D3.js manipula el DOM directamente. React/Next.js también
lo hace. Forzar D3 dentro del ciclo de render de React requiere workarounds
con `useRef`, `useEffect` y unmount manual que complican el código sin
aportar nada. Los estudios de referencia (NYT Graphics, The Pudding, Reuters
Graphics) usan exactamente este stack para sus piezas de data storytelling.

### División de responsabilidades

```
Next.js App Router
├── / (home)                ← React + Tailwind CSS  [YA CONSTRUIDO]
├── /cold-war-in-gold       ← page.tsx como contenedor mínimo:
│                              · Header/nav de Next.js
│                              · <div ref={containerRef} /> vacío
│                              · useEffect → initColdWar(containerRef.current)
│                              · Toda la lógica: Vanilla JS + D3 + GSAP
└── /atlas-cuerpo-olimpico  ← mismo patrón
```

### Estructura de archivos resultante en el proyecto

```
src/app/cold-war-in-gold/
├── page.tsx          ← Next.js page: shell mínimo + useEffect de init
├── cold-war.css      ← estilos de la historia (CSS custom properties)
├── data.ts           ← dataset tipado como const (TypeScript)
└── main.ts           ← lógica modular:
                         initSidePicker(), initChart(), initHover()
```

> **Nota**: los ficheros `data.ts` y `main.ts` son TypeScript pero sin JSX.
> Se importan en `page.tsx` y se llaman desde `useEffect`. No usan React hooks
> internamente — son módulos puros que reciben un `HTMLElement` como entrada.

---

## BACKLOG EN AZURE DEVOPS

Feature padre: **#174 — Cold War in Gold**

| ID  | Historia | Orden |
|-----|----------|-------|
| 215 | CWG-01: HTML base, CSS custom properties y tipografías | 1 |
| 216 | CWG-02: Side Picker — layout estático | 2 |
| 217 | CWG-03: Side Picker — animaciones GSAP y lógica de elección | 3 |
| 218 | CWG-04: Gráfico D3 estático con dataset completo (1952–2020) | 4 |
| 219 | CWG-05: Animación de entrada del gráfico (stroke-dasharray) | 5 |
| 220 | CWG-06: Puntos interactivos con tooltip de datos | 6 |
| 221 | CWG-07: Scrollytelling — 5 bloques narrativos + ScrollTrigger | 7 |
| 222 | CWG-08: Highlight de sección del gráfico sincronizado con scroll | 8 |
| 223 | CWG-09: Ficha lateral de contexto histórico + freeze effect | 9 |
| 224 | CWG-10: Estadísticas finales + animación de contador | 10 |
| 225 | CWG-11: Responsive móvil — layout columna única | 11 |

Cada historia tiene criterios de aceptación técnicos detallados en ADO.

---

## CONTEXTO DEL PROYECTO

Página de scrollytelling que narra el duelo de oros olímpicos entre USA y
la URSS/Rusia (1952–2020). Parte de una web mayor (Olympic Data Stories).
Sistema de diseño ya definido: fondo #0a0a0a, blanco cálido #F5F2EB, dorado
#C9A84C, tipografías Bebas Neue + Cormorant Garamond + DM Mono.

---

## ESTRUCTURA DE ARCHIVOS

```
src/app/cold-war-in-gold/
├── page.tsx          ← shell Next.js (ver sección Arquitectura)
├── cold-war.css      ← estilos de la historia
├── data.ts           ← dataset completo tipado
└── main.ts           ← módulos: initSidePicker(), initChart(), initHover()
```

### Patrón de page.tsx

```tsx
'use client'
import { useEffect, useRef } from 'react'
import './cold-war.css'

export default function ColdWarPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // importación dinámica para evitar SSR con D3/GSAP
    import('./main').then(({ initColdWar }) => {
      initColdWar(containerRef.current!)
    })
    return () => {
      // cleanup: destruir ScrollTrigger instances, event listeners
      import('./main').then(({ destroyColdWar }) => destroyColdWar())
    }
  }, [])

  return (
    <main>
      {/* header/nav de Next.js aquí si aplica */}
      <div ref={containerRef} id="cold-war-root" />
    </main>
  )
}
```

---

## FLUJO DE USUARIO

```
1. Llega a la página
       ↓
2. SIDE PICKER — elige USA o USSR (bloquea el scroll mientras no elige)
       ↓
3. Transición de entrada → la página se construye con los colores del bando
       ↓
4. Scroll narrativo — el texto de la izquierda cambia, el gráfico es sticky
       ↓
5. HOVER en puntos del gráfico → página se "congela", aparece ficha lateral
       ↓
6. CTA final → volver al home o ir a la siguiente story
```

---

## BLOQUE 1 — SIDE PICKER

### Qué es
Pantalla de entrada a pantalla completa (100vw × 100vh) que aparece antes
de que el usuario vea nada. Divide la pantalla en dos mitades verticales.
El scroll está bloqueado (`overflow: hidden` en body) hasta que se elige.

### Layout
```
┌──────────────────┬──────────────────┐
│                  │                  │
│    USA           │    USSR          │
│                  │                  │
│  [imagen/color   │  [imagen/color   │
│   de fondo]      │   de fondo]      │
│                  │                  │
│  PLAY AS USA  ↓  │  PLAY AS USSR ↓  │
│                  │                  │
└──────────────────┴──────────────────┘
```

### Comportamiento
- Al cargar: las dos mitades entran desde izquierda y derecha respectivamente
  con GSAP (`translateX(-100%)` → 0 y `translateX(100%)` → 0), duración 0.8s,
  easing `power3.out`, stagger 0.1s
- Al hover en una mitad: esa mitad se expande al 60% y la otra se reduce al 40%
  Transición CSS: `flex: 0.6` / `flex: 0.4`, duration 0.4s ease
- Al hacer click: GSAP anima la pantalla entera hacia arriba (`translateY(-100vh)`,
  0.6s, `power2.inOut`), luego se elimina del DOM y se libera el scroll

### Variables CSS que se setean al elegir
```js
// Si elige USA:
root.style.setProperty('--player-color', '#B22234')       // rojo USA
root.style.setProperty('--enemy-color', '#CC0000')         // rojo URSS
root.style.setProperty('--player-label', 'USA')
root.style.setProperty('--enemy-label', 'USSR')
root.style.setProperty('--victory-word', 'VICTORY')
root.style.setProperty('--defeat-word', 'DEFEAT')
root.style.setProperty('--player-flag-accent', '#B22234')

// Si elige USSR — exactamente al revés
```

### Contenido de cada mitad
```
USA                              USSR
───                              ────
[fondo: story-01-coldwar.jpg     [mismo fondo con hue-rotate(200deg)
 con overlay rojo #B22234 20%]    y overlay rojo #CC0000 20%]

"01 / 1952 — 1988"               "01 / 1952 — 1988"   ← DM Mono 0.7rem muted
"PLAY AS"                        "PLAY AS"             ← DM Mono 0.8rem gold
"USA"                            "USSR"                ← Bebas Neue 12vw white
"44 OLYMPIC GOLDS"               "395 OLYMPIC GOLDS"   ← DM Mono 0.9rem muted
[botón] CHOOSE THIS SIDE →       [botón] CHOOSE THIS SIDE →
```

### Elemento gráfico necesario
- `story-01-coldwar.jpg` (ya generado) como fondo de ambas mitades
- El lado USSR usa el mismo archivo con `filter: hue-rotate(200deg) saturate(0.8)`
  — no hace falta una segunda imagen

---

## BLOQUE 2 — LAYOUT PRINCIPAL (post-picker)

### Estructura
```
┌──────────────────────────────────────────────────────────┐
│ HEADER (fixed, 60px) — mismo que home, con back arrow    │
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│  TEXTO        │  GRÁFICO D3                              │
│  NARRATIVO    │  (sticky, top: 60px,                     │
│  (izq, 35%)   │   height: calc(100vh - 60px))            │
│               │                                          │
│  [cambia con  │  [no cambia, el scroll                   │
│   el scroll]  │   solo afecta al texto]                  │
│               │                                          │
├───────────────┴──────────────────────────────────────────┤
│  FILA DE ESTADÍSTICAS (fuera del sticky, al final)       │
└──────────────────────────────────────────────────────────┘
```

### Columna izquierda — bloques narrativos
Cada bloque ocupa 100vh para que ScrollTrigger pueda detectarlos.
Son 5 bloques en total:

```
Bloque 1 (0–100vh)
  Título: "THE SCOREBOARD THAT CHANGED HISTORY"
  Texto: introducción al duelo, 1952 Helsinki, primeros Juegos con USSR

Bloque 2 (100–200vh)
  Título: "USSR PULLS AHEAD"
  Texto: dominio soviético en los 60–70, Munich 1972 (USSR 50 oros vs USA 33)
  Highlight en el gráfico: años 1960–1976

Bloque 3 (200–300vh)  ← EL MÁS DRAMÁTICO
  Título: "THE YEAR AMERICA HAD 6 GOLDS"
  Texto: boicot de USA a Moscú 1980, contexto Afganistán
  Highlight: punto 1980, halo pulsante dorado

Bloque 4 (300–400vh)
  Título: "THE REVENGE THAT WASN'T"
  Texto: boicot soviético a Los Ángeles 1984
  Highlight: punto 1984

Bloque 5 (400–500vh)
  Título: "AFTER THE WALL"
  Texto: caída URSS, Rusia continúa, era moderna
  Highlight: toda la sección post-1992 se ilumina
```

### Implementación ScrollTrigger
```js
// Para cada bloque narrativo:
ScrollTrigger.create({
  trigger: `#block-${n}`,
  start: 'top center',
  end: 'bottom center',
  onEnter: () => highlightChartSection(n),
  onEnterBack: () => highlightChartSection(n),
  onLeave: () => resetChartHighlight(),
})
```

---

## BLOQUE 3 — GRÁFICO D3 (sticky)

### Especificaciones técnicas
```
Tipo:        líneas con área rellena
SVG:         responsive con viewBox, usa ResizeObserver
Márgenes:    { top: 40, right: 60, bottom: 50, left: 50 }
Escala X:    scaleLinear, dominio [1952, 2020]
Escala Y:    scaleLinear, dominio [0, 60]
```

### Líneas
```js
// Línea del jugador (color dinámico via CSS var)
const playerLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.player))
  .curve(d3.curveMonotoneX)

// Línea del enemigo
const enemyLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.enemy))
  .curve(d3.curveMonotoneX)
```

### Animación de entrada (stroke-dasharray)
```js
// Las líneas se dibujan de izquierda a derecha al cargar
const totalLength = path.node().getTotalLength()
path
  .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
  .attr('stroke-dashoffset', totalLength)

gsap.to(path.node(), {
  strokeDashoffset: 0,
  duration: 2.5,
  ease: 'power2.inOut',
  delay: 0.3
})
```

### Áreas rellenas (bajo cada línea)
```js
const area = d3.area()
  .x(d => xScale(d.year))
  .y0(yScale(0))
  .y1(d => yScale(d.player))
  .curve(d3.curveMonotoneX)

// fill: var(--player-color), opacity: 0.06
```

### Puntos interactivos
- Círculo radio 5px en cada año, relleno con el color del país
- Al hover: escala a r=9, aparece tooltip (ver Bloque 4)
- Los dos puntos de boicot (1980 USA, 1984 USSR) tienen:
  - Radio base mayor: 7px
  - Halo animado: segundo círculo concéntrico con `opacity: 0.3`
    y animación CSS `@keyframes pulse` (escala 1→1.8, opacity 0.3→0)
  - Etiqueta visible sin hover: texto pequeño sobre el punto

### Anotaciones de boicot (visibles siempre)
```js
// Línea conectora fina desde el punto hasta el texto
svg.append('line')
  .attr('x1', xScale(1980)).attr('y1', yScale(6))
  .attr('x2', xScale(1980)).attr('y2', yScale(6) - 40)
  .attr('stroke', '#C9A84C')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '3,3')

svg.append('text')
  .text('USA BOYCOTT · 6 GOLDS')
  .attr('x', xScale(1980))
  .attr('y', yScale(6) - 48)
  .attr('fill', '#C9A84C')
  .attr('font-family', 'DM Mono')
  .attr('font-size', '10px')
  .attr('text-anchor', 'middle')
```

### Highlight de sección (activado por ScrollTrigger)
```js
function highlightChartSection(blockIndex) {
  // Los años que NO corresponden al bloque activo se oscurecen
  // usando un rect overlay semitransparente sobre el rango inactivo
  // opacity del overlay: 0.6, color: #0a0a0a
  // transición: GSAP 0.5s
}
```

---

## BLOQUE 4 — HOVER INTERACTIVO (feature principal)

### Comportamiento completo
Al hacer `mouseover` en cualquier punto del gráfico:

1. **La página se "congela"**: GSAP reduce `opacity` del texto narrativo a 0.15
   y del resto del gráfico a 0.3. Solo el punto hover y la ficha se ven a full.
   Duración: 0.25s

2. **Aparece la ficha lateral** (panel derecho, fuera del SVG):
   Animación: `translateX(20px) + opacity 0` → `translateX(0) + opacity 1`, 0.3s

3. Al hacer `mouseout`: todo vuelve a normal, la ficha desaparece.
   Duración: 0.2s

### Contenido de la ficha (varía según el bando elegido)
```
┌─────────────────────────────────┐
│ MOSCOW 1980          ← DM Mono 0.7rem gold
│ ─────────────────────
│                                 │
│ YOUR SIDE           ENEMY       │  ← DM Mono 0.65rem muted
│   6                  45         │  ← Bebas Neue 5vw, colores de bando
│  GOLDS              GOLDS       │  ← DM Mono 0.65rem muted
│                                 │
│ ─────────────────────
│ USA boycotted the Moscow        │  ← Cormorant Garamond 1rem
│ Games following the Soviet      │
│ invasion of Afghanistan.        │
│                                 │
│ RESULT: DEFEAT      ← var(--defeat-word), color según bando
└─────────────────────────────────┘
```

### Textos de contexto histórico por año (hardcoded en data.js)
```js
const historicalContext = {
  1952: "First Games with USSR participation. Helsinki becomes ground zero.",
  1956: "Soviet tanks in Hungary. The Games go on in Melbourne.",
  1960: "USSR pulls ahead in Rome. Cassius Clay wins gold for USA.",
  1964: "Tokyo marks peak Olympic diplomacy. USSR leads 20–18.",
  1968: "Mexico City. Protest and politics overshadow competition.",
  1972: "Munich massacre. USSR dominates 29–18.",
  1976: "Montréal financial disaster. USSR extends lead 31–18.",
  1980: "USA boycotts Moscow after Soviet invasion of Afghanistan. 65 nations follow.",
  1984: "USSR retaliates. Boycotts Los Angeles. 14 Eastern Bloc nations absent.",
  1988: "Seoul. Last Cold War Games. USSR wins final showdown 33–19.",
  1996: "Russia — not USSR — competes for the first time. USA dominates Atlanta.",
  2000: "Sydney. Closest post-Cold War result: USA 37, Russia 32.",
  2004: "Athens. USA edges Russia 36–28.",
  2008: "Beijing. China enters the race. USA 36, Russia 24.",
  2012: "London. USA asserts dominance 48–18.",
  2016: "Rio. Russia doping scandal. Partial ban. USA 46, Russia 19.",
  2020: "Tokyo. Russia competes as ROC. Geopolitics return to the podium.",
}
```

---

## BLOQUE 5 — ESTADÍSTICAS FINALES

Aparece al terminar el scroll, fuera del área sticky.
Cuatro columnas en una fila, separadas por líneas verticales `1px --gray`:

```
TOTAL [PLAYER] GOLDS  |  TOTAL [ENEMY] GOLDS  |  [PLAYER] WINS  |  [ENEMY] WINS
      [número]        |        [número]        |    [número]     |    [número]
```

**Counter animation** — los números cuentan desde 0 al entrar en viewport:
```js
// Con GSAP:
gsap.to(counterElement, {
  innerHTML: targetValue,
  duration: 2,
  ease: 'power1.out',
  snap: { innerHTML: 1 },  // solo números enteros
  scrollTrigger: { trigger: statSection, start: 'top 80%' }
})
```

Los labels (`TOTAL [PLAYER] GOLDS`) usan la CSS var `--player-label`
para mostrar USA o USSR según el bando elegido.

---

## DATASET COMPLETO (data.js)

```js
export const coldWarData = [
  { year: 1952, city: "Helsinki",    player_usa: 22, player_ussr: 22 },
  { year: 1956, city: "Melbourne",   player_usa: 17, player_ussr: 22 },
  { year: 1960, city: "Rome",        player_usa: 18, player_ussr: 25 },
  { year: 1964, city: "Tokyo",       player_usa: 18, player_ussr: 20 },
  { year: 1968, city: "Mexico City", player_usa: 23, player_ussr: 17 },
  { year: 1972, city: "Munich",      player_usa: 18, player_ussr: 29 },
  { year: 1976, city: "Montreal",    player_usa: 18, player_ussr: 31 },
  { year: 1980, city: "Moscow",      player_usa:  6, player_ussr: 45, boycott: "USA" },
  { year: 1984, city: "Los Angeles", player_usa: 44, player_ussr:  6, boycott: "USSR" },
  { year: 1988, city: "Seoul",       player_usa: 19, player_ussr: 33 },
  { year: 1996, city: "Atlanta",     player_usa: 44, player_ussr: 26, era: "post" },
  { year: 2000, city: "Sydney",      player_usa: 37, player_ussr: 32, era: "post" },
  { year: 2004, city: "Athens",      player_usa: 36, player_ussr: 28, era: "post" },
  { year: 2008, city: "Beijing",     player_usa: 36, player_ussr: 24, era: "post" },
  { year: 2012, city: "London",      player_usa: 48, player_ussr: 18, era: "post" },
  { year: 2016, city: "Rio",         player_usa: 46, player_ussr: 19, era: "post" },
  { year: 2020, city: "Tokyo",       player_usa: 39, player_ussr: null, era: "post" },
]
```

---

## ELEMENTOS GRÁFICOS NECESARIOS

```
/assets/img/
└── story-01-coldwar.jpg   ← YA GENERADO, fondo del side picker

/assets/fonts/             ← cargar desde Google Fonts CDN
  Bebas Neue
  Cormorant Garamond (300, 400, italic)
  DM Mono (400, 500)
```

No se necesitan más imágenes — toda la página es texto, SVG y CSS.

---

## DEPENDENCIAS npm

```bash
npm install d3 gsap
npm install --save-dev @types/d3
```

Tipografías: Google Fonts via `<link>` en `layout.tsx` del proyecto (ya existe el
sistema de fuentes global) o importadas en `cold-war.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@400;500&display=swap');
```

En `main.ts`, los imports son:

```ts
import * as d3 from 'd3'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
```

---

## ORDEN DE IMPLEMENTACIÓN

Construir siguiendo las User Stories del backlog en orden — cada una es
verificable antes de continuar con la siguiente:

```
CWG-01  page.tsx shell + cold-war.css base + CSS vars + fuentes  (verificar: layout visible)
CWG-02  Side Picker — estructura estática                        (verificar: dos mitades)
CWG-03  Side Picker — GSAP + lógica de elección + CSS vars       (verificar: transición y colores)
CWG-04  Gráfico D3 estático con dataset completo                 (verificar: líneas visibles)
CWG-05  Animación de entrada stroke-dasharray                    (verificar: se dibujan)
CWG-06  Puntos interactivos + tooltip básico                     (verificar: hover funciona)
CWG-07  ScrollTrigger — 5 bloques narrativos                     (verificar: texto cambia al scrollear)
CWG-08  Highlight de sección del gráfico por scroll              (verificar: oscurecimiento)
CWG-09  Ficha lateral + freeze effect al hover                   (verificar: página se congela)
CWG-10  Estadísticas finales + counter animation                 (verificar: números cuentan)
CWG-11  Responsive móvil                                         (verificar: layout columna única)
```

### Estado de ejecución (2026-04-27)

- CWG-01 / Historia 215: en progreso
- Implementado: shell cliente en `page.tsx`, estilos base en `cold-war.css`,
  módulo `main.ts` con `initColdWar()`/`destroyColdWar()`, dataset tipado en
  `data.ts`
- Verificado: `npm run lint` sin errores
- Siguiente historia: CWG-02 (Side Picker estático)

### Notas de integración Next.js

- Importar D3 y GSAP como módulos npm (`d3`, `gsap`) — no CDN — para
  compatibilidad con el bundler de Next.js
- Los módulos `main.ts` y `data.ts` no usan JSX ni hooks de React
- `initColdWar(container)` recibe el `HTMLDivElement` como parámetro;
  toda manipulación del DOM ocurre dentro de ese contenedor
- `destroyColdWar()` debe limpiar: `ScrollTrigger.getAll().forEach(t => t.kill())`,
  event listeners del Side Picker y observadores (ResizeObserver)
- El CSS de la historia va en `cold-war.css` importado en `page.tsx`;
  las CSS custom properties se setean en el `#cold-war-root` div, no en `:root`,
  para evitar contaminar el sistema de diseño global
