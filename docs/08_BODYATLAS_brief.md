# BRIEF — BODY ATLAS
## Página interior · Olympic Data Stories
### Stack: Vanilla JS + D3.js v7 + GSAP 3 + CSS Custom Properties

---

## CONCEPTO

Visualización interactiva que muestra cómo cada deporte olímpico moldea
un cuerpo distinto. El usuario ve siluetas humanas escaladas por la altura
y peso real de los atletas de cada deporte, ordenables y filtrables.

No hay scroll narrativo como en Cold War. Esta página es exploratoria:
el usuario interactúa directamente con el gráfico.

Dato de impacto: 28.3cm separan al gimnasta artístico (162.9cm)
del jugador de baloncesto (191.2cm). El BMI va de 17.3 (gimnasia rítmica)
a 27.8 (halterofilia).

---

## ESTRUCTURA DE ARCHIVOS

```
body-atlas/
├── index.html
├── style.css
├── data.js       ← dataset + metadatos de deportes
└── main.js       ← initFilters(), initSilhouettes(), initDetailPanel()
```

---

## FLUJO DE USUARIO

```
1. Llega a la página → ve todas las siluetas ordenadas por altura (default)
       ↓
2. Explora los controles: toggle Male/Female, sort by Height/Weight/BMI
       ↓
3. Hace hover en una silueta → se ilumina y aparece tooltip rápido
       ↓
4. Hace click en una silueta → se abre panel de detalle lateral
       ↓
5. Panel muestra stats completas del deporte + comparativa con la media olímpica
       ↓
6. Click fuera o en X → panel se cierra, vuelve al estado exploratorio
```

---

## LAYOUT GLOBAL

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (fixed, 60px) — mismo sistema que home            │
├──────────────────────────────────────────────────────────┤
│ HERO SECTION (100vh)                                     │
│   Título + dato de impacto + instrucción de uso          │
├──────────────────────────────────────────────────────────┤
│ CONTROL BAR (sticky bajo el header)                      │
│   [Male/Female toggle] · [Sort: Height/Weight/BMI]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ SILHOUETTE GRID                                          │
│ (área principal, scroll vertical libre)                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ STAT BAR (fixed bottom, aparece al hacer click)          │
│ Panel de detalle del deporte seleccionado                │
└──────────────────────────────────────────────────────────┘
```

---

## SECCIÓN HERO (100vh)

```
[línea superior] 02 / BODY ATLAS     ← DM Mono 0.75rem --gold
[título]         THE BODY            ← Bebas Neue 14vw --white
                 THE SPORT BUILT     ← Bebas Neue 14vw --gold

[línea divisoria 1px --gray, 200px ancho]

[dato de impacto, centrado]
  28.3 CM                            ← Bebas Neue 6vw --white
  separate the shortest              ← Cormorant Garamond italic 1.2rem --muted
  from the tallest Olympic athlete   ← Cormorant Garamond italic 1.2rem --muted

[instrucción]
  CLICK A SPORT TO EXPLORE           ← DM Mono 0.75rem --muted, con flecha animada ↓
```

Fondo: `body-atlas-texture.png` desde `public/images` al 8% de opacidad.

---

## CONTROL BAR (sticky, top: 60px, altura 56px)

Fondo `rgba(10,10,10,0.95)` + `backdrop-filter: blur(8px)`.
Borde inferior `1px solid --gray`.

### Toggle Male / Female

```
  [ MALE ]  [ FEMALE ]
```

Dos botones pill. El activo tiene `background: --gold`, texto `#0a0a0a`.
El inactivo tiene `border: 1px solid --gray`, texto `--muted`.
Al cambiar: las siluetas se reaniman con transición D3 (ver implementación).

### Sort controls

```
  SORT BY:  [ HEIGHT ]  [ WEIGHT ]  [ BMI ]
```

Mismo sistema de botones pill. Default: HEIGHT.
Al cambiar el sort: las siluetas se reordenan con transición D3 `duration(600)`.

### Contador de deportes

```
  Derecha: "SHOWING 20 SPORTS"     ← DM Mono 0.7rem --muted
```

---

## SILHOUETTE GRID — el gráfico principal

### Concepto de implementación

No es un SVG único. Es un grid de divs, uno por deporte, cada uno
conteniendo un SVG individual con la silueta escalada.

```html
<div class="sport-card" data-sport="Basketball" data-height="191.2" data-weight="85.7">
  <svg class="silhouette"> ... </svg>
  <span class="sport-name">Basketball</span>
  <span class="sport-stat">191.2 cm</span>
</div>
```

### Sistema de escala de siluetas

La silueta más alta (Basketball, 191.2cm) ocupa el 100% del alto
del contenedor. El resto se escalan proporcionalmente:

```js
const maxHeight = 191.2  // Basketball
const minHeight = 162.9  // Artistic Gymnastics
const containerHeight = 280  // px, altura del contenedor de cada card

const scaleY = d => (d.avg_height / maxHeight) * containerHeight
const scaleX = d => (d.avg_weight / 85.7) * baseWidth  // ancho proporcional al peso
```

Todas las siluetas tienen la misma baseline (los pies alineados abajo).
La diferencia de altura es inmediatamente visible.

### Silueta SVG

Una silueta humana genérica simplificada (no realista, no detallada).
Estilo: forma orgánica con path SVG, sin rasgos faciales ni detalles.
Similar a un icono de persona de diseño editorial.

```svg
<!-- Silueta base — escalar con transform="scale(sx, sy)" -->
<svg viewBox="0 0 60 160" preserveAspectRatio="xMidYMax meet">
  <path d="M30,8 a8,8 0 1,0 0.01,0 Z         /* cabeza */
           M22,16 Q15,40 18,80 L20,130 ...   /* cuerpo simplificado */
           ..." fill="currentColor"/>
</svg>
```

La silueta usa `fill: currentColor` para que el color se controle por CSS.

### Estados de cada card

**Default:**
- Silueta: `color: #3a3a3a` (gris oscuro)
- Sport name: DM Mono 0.7rem --muted
- Stat: DM Mono 0.75rem --muted

**Hover:**
- Silueta: `color` cambia al color del aro olímpico asignado al deporte
  (ver tabla de colores por deporte abajo), transición 0.2s
- Sport name: color --white
- Stat: color --gold
- La card tiene un sutil `background: rgba(255,255,255,0.03)`
- Aparece tooltip rápido (ver sección Tooltip)

**Activo (click):**
- Silueta: color del aro + `filter: drop-shadow(0 0 8px currentColor)`
- Borde card: `1px solid` color del aro correspondiente
- Se abre el panel de detalle (ver sección Panel)

### Colores por deporte (aros olímpicos como sistema)

```js
const sportColors = {
  // Azul — deportes acuáticos y de hielo
  'Swimming':               '#0085C7',
  'Water Polo':             '#0085C7',
  'Diving':                 '#0085C7',
  'Artistic Swimming':      '#0085C7',
  'Ice Hockey':             '#0085C7',
  'Figure Skating':         '#0085C7',
  'Speed Skating':          '#0085C7',
  'Short Track Speed Skating': '#0085C7',

  // Rojo — deportes de combate y potencia
  'Boxing':                 '#DF0024',
  'Wrestling':              '#DF0024',
  'Judo':                   '#DF0024',
  'Taekwondo':              '#DF0024',
  'Weightlifting':          '#DF0024',

  // Verde — deportes de exterior y naturaleza
  'Athletics':              '#009F6B',
  'Cycling Road':           '#009F6B',
  'Cycling Track':          '#009F6B',
  'Cycling Mountain Bike':  '#009F6B',
  'Triathlon':              '#009F6B',
  'Rowing':                 '#009F6B',

  // Amarillo — deportes de equipo
  'Basketball':             '#F4C300',
  'Volleyball':             '#F4C300',
  'Beach Volleyball':       '#F4C300',
  'Handball':               '#F4C300',
  'Football':               '#F4C300',

  // Default para el resto: dorado olímpico
  'default':                '#C9A84C',
}
```

### Tooltip (hover rápido)

Pequeño tooltip flotante que aparece sobre la card al hacer hover.
No reemplaza al panel de detalle — es solo una preview rápida.

```
┌───────────────────┐
│ BASKETBALL        │  ← DM Mono 0.65rem --gold
│ ─────────────────  │
│ 191.2 cm          │  ← Bebas Neue 1.6rem --white
│ 85.7 kg           │  ← DM Mono 0.75rem --muted
│ BMI 23.4          │  ← DM Mono 0.75rem --muted
└───────────────────┘
```

Fondo `#161616`, borde `1px solid` color del deporte, padding 12px.
Aparece con `opacity 0→1 + translateY(4px→0)`, duración 0.15s.

---

## PANEL DE DETALLE LATERAL

Se abre al hacer click en una card. Ocupa el 30% derecho del viewport,
deslizando desde la derecha (`translateX(100%)→0`, GSAP 0.4s, `power2.out`).

### Estructura del panel

```
┌──────────────────────────────┐
│  [X]              BASKETBALL │  ← DM Mono, botón cerrar izq
│  ──────────────────────────  │
│                              │
│  [SILUETA GRANDE CENTRADA]   │  ← silueta del deporte a 60% altura panel
│                              │
│  ──────────────────────────  │
│  AVG HEIGHT                  │  ← DM Mono 0.65rem --muted
│  191.2 CM                    │  ← Bebas Neue 3.5vw --white
│                              │
│  AVG WEIGHT                  │
│  85.7 KG                     │
│                              │
│  BMI INDEX                   │
│  23.4                        │
│                              │
│  ──────────────────────────  │
│  VS OLYMPIC AVERAGE          │  ← DM Mono 0.65rem --gold
│                              │
│  [barra comparativa altura]  │  ← D3 mini bar chart
│  [barra comparativa peso]    │
│  [barra comparativa BMI]     │
│                              │
│  ──────────────────────────  │
│  [DATO CURIOSO DEL DEPORTE]  │  ← Cormorant italic 1rem --muted
└──────────────────────────────┘
```

### Barras comparativas (mini D3 dentro del panel)

Tres barras horizontales que muestran el deporte activo vs la media olímpica.

```
HEIGHT
Olympic avg  ████████████░░░░  174.2 cm
Basketball   ████████████████  191.2 cm  (+17cm)
```

La barra del deporte usa el color del aro asignado.
La barra de la media olímpica usa `--gray`.
El delta `(+17cm)` en DM Mono, color del aro si es positivo, `--ring-red` si negativo.

**Medias olímpicas globales (calculadas del CSV):**
```js
const olympicAverage = {
  male:   { height: 178.2, weight: 76.1, bmi: 23.9 },
  female: { height: 168.4, weight: 61.8, bmi: 21.8 },
  overall:{ height: 174.2, weight: 70.4, bmi: 23.2 },
}
```

### Datos curiosos por deporte (hardcoded)

```js
const sportFacts = {
  'Basketball':          "The tallest sport in Olympic history. Every cm counts.",
  'Artistic Gymnastics': "The lightest power-to-weight ratio of any Olympic sport.",
  'Weightlifting':       "Highest BMI on the podium. Pure functional mass.",
  'Rowing':              "The sport that builds the longest wingspan.",
  'Ski Jumping':         "Underweight by any standard — lighter means longer flight.",
  'Rhythmic Gymnastics': "BMI 17.3. The thinnest body profile in Olympic competition.",
  'Swimming':            "184cm average for men. Height is an unfair advantage.",
  'Water Polo':          "Combines swimmer's height with wrestler's power.",
  // ... añadir para todos los deportes del dataset
}
```

---

## DATASET (data.js)

```js
// Datos reales extraídos del CSV
export const bodyData = {
  male: [
    { sport: "Basketball",             height: 195.5, weight: 91.8, bmi: 24.1 },
    { sport: "Volleyball",             height: 193.4, weight: 86.9, bmi: 23.2 },
    { sport: "Beach Volleyball",       height: 193.5, weight: 89.6, bmi: 23.9 },
    { sport: "Water Polo",             height: 187.2, weight: 87.9, bmi: 25.1 },
    { sport: "Rowing",                 height: 186.9, weight: 83.8, bmi: 23.9 },
    { sport: "Handball",               height: 188.8, weight: 89.6, bmi: 25.1 },
    { sport: "Swimming",               height: 184.4, weight: 78.0, bmi: 22.9 },
    { sport: "Tennis",                 height: 185.1, weight: 79.0, bmi: 23.1 },
    { sport: "Ice Hockey",             height: 181.3, weight: 84.1, bmi: 25.6 },
    { sport: "Canoe Sprint",           height: 181.9, weight: 81.3, bmi: 24.5 },
    { sport: "Athletics",              height: 179.7, weight: 73.7, bmi: 22.8 },
    { sport: "Cycling Track",          height: 178.9, weight: 75.5, bmi: 23.6 },
    { sport: "Judo",                   height: 177.6, weight: 83.4, bmi: 26.4 },
    { sport: "Boxing",                 height: 172.9, weight: 65.3, bmi: 21.8 },
    { sport: "Weightlifting",          height: 169.2, weight: 80.7, bmi: 28.2 },
    { sport: "Wrestling",              height: 173.0, weight: 76.7, bmi: 25.6 },
    { sport: "Diving",                 height: 171.7, weight: 67.0, bmi: 22.7 },
    { sport: "Artistic Gymnastics",    height: 167.6, weight: 63.3, bmi: 22.5 },
    { sport: "Ski Jumping",            height: 176.6, weight: 64.8, bmi: 20.8 },
    { sport: "Figure Skating",         height: 176.3, weight: 70.0, bmi: 22.5 },
  ],
  female: [
    { sport: "Basketball",             height: 182.6, weight: 73.8, bmi: 22.1 },
    { sport: "Volleyball",             height: 179.7, weight: 69.4, bmi: 21.5 },
    { sport: "Beach Volleyball",       height: 179.2, weight: 68.6, bmi: 21.4 },
    { sport: "Water Polo",             height: 175.8, weight: 70.4, bmi: 22.8 },
    { sport: "Rowing",                 height: 176.8, weight: 70.1, bmi: 22.4 },
    { sport: "Handball",               height: 174.9, weight: 69.0, bmi: 22.5 },
    { sport: "Swimming",               height: 171.6, weight: 61.5, bmi: 20.9 },
    { sport: "Tennis",                 height: 172.5, weight: 62.2, bmi: 20.9 },
    { sport: "Athletics",              height: 169.3, weight: 60.2, bmi: 21.0 },
    { sport: "Cycling Track",          height: 168.6, weight: 64.1, bmi: 22.5 },
    { sport: "Judo",                   height: 166.2, weight: 66.0, bmi: 23.9 },
    { sport: "Boxing",                 height: 168.6, weight: 61.6, bmi: 21.7 },
    { sport: "Weightlifting",          height: 160.5, weight: 67.3, bmi: 26.1 },
    { sport: "Wrestling",              height: 164.2, weight: 61.0, bmi: 22.6 },
    { sport: "Diving",                 height: 161.2, weight: 53.6, bmi: 20.6 },
    { sport: "Artistic Gymnastics",    height: 156.2, weight: 47.8, bmi: 19.6 },
    { sport: "Rhythmic Gymnastics",    height: 167.8, weight: 48.8, bmi: 17.3 },
    { sport: "Figure Skating",         height: 160.4, weight: 49.8, bmi: 19.4 },
    { sport: "Artistic Swimming",      height: 168.5, weight: 55.8, bmi: 19.7 },
    { sport: "Ski Jumping",            height: 164.7, weight: 52.6, bmi: 19.4 },
  ],
}

export const olympicAverage = {
  male:    { height: 178.2, weight: 76.1, bmi: 23.9 },
  female:  { height: 168.4, weight: 61.8, bmi: 21.8 },
}
```

---

## ELEMENTOS GRÁFICOS NECESARIOS

```
/public/images/
└── body-atlas-texture.png   ← textura base del hero, usar al 8% de opacidad

/assets/svg/
└── silhouette-base.svg      ← silueta humana genérica (ver nota abajo)
```

### Nota sobre la silueta SVG

La silueta se crea directamente en código — no es un archivo externo.
Es un path SVG simplificado que se escala con D3. No se necesita generar
ninguna imagen para las siluetas.

Si se quiere una silueta más refinada se puede usar un SVG de Heroicons,
Phosphor Icons o similar con licencia MIT — buscar "person silhouette SVG MIT license".

### Imagen de fondo para el hero (opcional)

Si se quiere una imagen específica para el hero de Body Atlas:

**Prompt Firefly:**
```
Multiple athletic human body shadows projected on white gymnasium wall,
different heights and builds visible in silhouette, dramatic side lighting
casting long sharp shadows, black and white photography, minimalist sports
aesthetic, clean background, high contrast, studio lighting
```
- Content type: `Photo`
- Style: `Black and white` + `Minimalist`

---

## COPY DE LA PÁGINA

### Hero
```
Número:    02 / BODY ATLAS
Título:    THE BODY / THE SPORT BUILT
Dato:      28.3 CM separate the shortest from the tallest Olympic athlete
CTA:       CLICK A SPORT TO EXPLORE ↓
```

### Subtítulo bajo los controles
```
Showing average height and weight of Olympic athletes by sport.
Data from 100,000+ athletes across 128 years of competition.
```
DM Mono 0.7rem, --muted, centrado.

### Texto de cierre (al final del grid, antes del footer)
```
[USA VERSION / sin bando, esta historia no tiene Side Picker]

Every body here was built by repetition.
Ten thousand hours of the same movement,
until the sport becomes the shape.
```
Cormorant Garamond italic, 1.4rem, --muted, centrado, max-width 480px.

---

## ORDEN DE IMPLEMENTACIÓN PARA COPILOT

```
1. HTML base + hero section                          (verificar: hero visible)
2. Control bar — toggle y sort, solo HTML/CSS        (verificar: botones se ven)
3. Dataset en data.js                                (verificar: consola sin errores)
4. Grid de cards con siluetas escaladas (D3)         (verificar: siluetas visibles)
5. Sistema de colores por deporte                    (verificar: cada card su color)
6. Hover → cambio de color + tooltip                 (verificar: interacción fluida)
7. Sort — reordenación animada con D3 transition     (verificar: animación suave)
8. Toggle Male/Female — cambia datos y reanima       (verificar: siluetas cambian)
9. Click → panel de detalle deslizante               (verificar: panel abre/cierra)
10. Barras comparativas dentro del panel (mini D3)   (verificar: datos correctos)
11. Responsivo móvil (grid 2 cols, panel full width) (verificar: funciona en móvil)
```

---

## PROMPT INICIAL PARA COPILOT

```
Build Body Atlas page following this brief.
Stack: Vanilla JS + D3.js v7 (CDN) + GSAP 3 (CDN) + CSS custom properties.
Single HTML file with <style> and <script> tags.
Start with steps 1–3 only: HTML base with hero section, sticky control bar
with Male/Female toggle and Height/Weight/BMI sort buttons (HTML and CSS only,
no JS logic yet), and the dataset from data.js as an inline const.
Use the same CSS variables as the rest of the project:
--bg: #0a0a0a, --white: #F5F2EB, --gold: #C9A84C, --muted: #666666,
--gray: #3a3a3a. Fonts: Bebas Neue, Cormorant Garamond, DM Mono from Google Fonts.
No explanations. Code only.
```
