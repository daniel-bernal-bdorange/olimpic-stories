# BRIEF — LOST SPORTS
## Página interior · Olympic Data Stories
### Stack: Vanilla JS + D3.js v7 + GSAP 3 + CSS Custom Properties

---

## CONCEPTO

Timeline interactivo de deportes que existieron en los Juegos Olímpicos
y desaparecieron. El usuario los descubre en orden cronológico de
desaparición. El factor sorpresa es el elemento central: la mayoría
de la gente no sabe que los Bomberos, la Pesca o el Polo fueron olímpicos.

El tono es de **archivo histórico de museo** — oscuro, solemne, con
sensación de algo perdido. Cada deporte tiene su propia "ficha de
defunción" con el año en que murió, quién dominó mientras existió,
y por qué desapareció.

Dato de impacto: **32 deportes** han desaparecido del programa olímpico
desde 1900. El último fue el Softball en 2012.

---

## ESTRUCTURA DE ARCHIVOS

```
lost-sports/
├── index.html
├── style.css
├── data.js       ← dataset de deportes + metadatos históricos
└── main.js       ← initTimeline(), initCards(), initFilter()
```

---

## FLUJO DE USUARIO

```
1. Llega → hero con dato de impacto ("32 sports. Forgotten.")
       ↓
2. Scroll → las tarjetas aparecen una a una sobre la línea de tiempo
       ↓
3. Hover en tarjeta → se ilumina, aparece preview del deporte
       ↓
4. Click en tarjeta → se expande mostrando datos completos + contexto
       ↓
5. Click en filtro de era → muestra solo deportes de ese periodo
       ↓
6. CTA al final → enlace a la siguiente story
```

---

## LAYOUT GLOBAL

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (fixed, 60px)                                     │
├──────────────────────────────────────────────────────────┤
│ HERO (100vh)                                             │
│   Título + dato de impacto                               │
├──────────────────────────────────────────────────────────┤
│ FILTER BAR (sticky)                                      │
│   [ ALL ] [ 1900s ] [ 1910s–20s ] [ 1930s–50s ] [ RECENT]│
├────────────────┬─────────────────────────────────────────┤
│                │                                         │
│  LÍNEA DE      │  TARJETAS DE DEPORTES                   │
│  TIEMPO        │  (scroll vertical libre)                │
│  (izq, 80px)   │                                         │
│                │                                         │
└────────────────┴─────────────────────────────────────────┘
```

---

## SECCIÓN HERO (100vh)

```
[número]   03 / LOST SPORTS          ← DM Mono 0.75rem --gold

[título]   FORGOTTEN                 ← Bebas Neue 16vw --white
           BY THE GAMES              ← Bebas Neue 16vw --gold

[divisor]  ──────────────            ← 1px --gray, 160px, centrado

[dato]     32                        ← Bebas Neue 7vw --white
           sports removed from       ← Cormorant italic 1.2rem --muted
           the Olympic programme     ← Cormorant italic 1.2rem --muted
           since 1900.               ← Cormorant italic 1.2rem --muted

[sub]      Some for good reasons.    ← Cormorant italic 1rem #555
           Some for no reason at all.← Cormorant italic 1rem #555

[CTA]      SCROLL TO DISCOVER ↓      ← DM Mono 0.75rem --muted, bounce
```

**Fondo hero:** imagen de equipamiento vintage en penumbra (ver sección
de elementos gráficos). Overlay negro 70%.

---

## FILTER BAR (sticky, top: 60px, altura 52px)

Cinco filtros de era que muestran/ocultan tarjetas.

```
[ ALL · 32 ]  [ PARIS 1900 · 12 ]  [ 1908–1924 · 9 ]  [ 1928–1952 · 8 ]  [ 1956–2012 · 3 ]
```

- Estilo: botones pill, mismo sistema que Body Atlas
- El número indica cuántos deportes hay en cada era
- Al activar un filtro: las tarjetas de otras eras hacen
  `opacity: 0.15` y `pointer-events: none` con GSAP 0.3s
- El filtro activo usa `--gold` como color de fondo

---

## LÍNEA DE TIEMPO (columna izquierda, 80px)

Línea vertical `2px solid #3a3a3a` que recorre toda la página.
En cada año importante hay un marcador:

```
1900 ●──  (punto lleno --gold cuando hay tarjeta activa)
     │
     │
1904 ●──
     │
1908 ●──
```

- Los años se muestran en DM Mono 0.65rem --muted
- El punto del año activo (más cercano al viewport center) se ilumina
  en `--gold` con una animación `scale(1→1.4)` suave
- La línea vertical se dibuja con `stroke-dasharray` al cargar
  (mismo efecto que las líneas D3 del Cold War)

---

## TARJETAS DE DEPORTES

### Layout de tarjetas

Grid de una columna, margen izquierdo de 80px (respeta la timeline).
Cada tarjeta tiene alineación alternada: izquierda / derecha del centro
para crear el efecto zigzag de revista.

```
        [ TARJETA — izquierda, 65% de ancho ]

                              [ TARJETA — derecha, 65% de ancho ]

        [ TARJETA — izquierda ]
```

En móvil: columna única sin zigzag, 100% de ancho.

### Animación de entrada (ScrollTrigger)

Cada tarjeta entra desde su lado con:
- `opacity: 0 → 1`
- `translateX(±40px → 0)` (izquierda o derecha según alternancia)
- Duración: 0.6s, easing: `power2.out`
- Trigger: `top 75%` del viewport

### Estado COLAPSADO (default)

```
┌──────────────────────────────────────────────────────┐
│  [año desaparición]        [bandera emoji del país]  │
│  POLO                                        GBR 46% │
│  ──────────────────────────────────────────────────  │
│  1900 — 1936 · 5 OLYMPIC EDITIONS                    │
│                                                      │
│  [barra de vida: ████████░░░░░░░░░░░░░░░░░░░ 1936]   │
│                                                      │
│  [icono SVG minimalista del deporte]                 │
└──────────────────────────────────────────────────────┘
```

**Tipografía:**
- Año: DM Mono 0.7rem, --muted
- Nombre deporte: Bebas Neue 2.8vw, --white
- País + %: DM Mono 0.7rem, color del aro asignado
- Fechas + ediciones: DM Mono 0.75rem, --muted
- Barra de vida: SVG inline, `--gold` para años activos, `--gray` para vacíos

**Hover:**
- Borde superior: `2px solid --gold` aparece con transición 0.2s
- Fondo: `rgba(255,255,255,0.03)`
- El icono del deporte hace `scale(1.05)`

### Estado EXPANDIDO (click)

La tarjeta crece con GSAP (`height: auto`, `duration: 0.5s`) mostrando:

```
┌──────────────────────────────────────────────────────┐
│  [contenido colapsado — sigue visible]               │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  WHY IT DISAPPEARED                  ← DM Mono --gold│
│  [texto de contexto histórico]       ← Cormorant 1rem│
│                                                      │
│  WHO DOMINATED                                       │
│  [mini bar chart D3 — países y % medallas]           │
│                                                      │
│  FUN FACT                                            │
│  [dato curioso]                      ← Cormorant italic│
│                                                      │
│  [botón] COLLAPSE ↑                                  │
└──────────────────────────────────────────────────────┘
```

**Mini bar chart horizontal (D3):**
```
GBR  ████████████████████  46%
USA  ████████             22%
ARG  ██████               14%
```
Barras de `--gray` con el primer país en `--gold`.
Altura total: 120px. Sin ejes, sin etiquetas de eje.

---

## DATASET (data.js)

Selección de los 12 deportes más narrativos del CSV:

```js
export const lostSports = [
  {
    sport:      "Cricket",
    years:      "1900",
    first:      1900,
    last:       1900,
    editions:   1,
    dominant:   "GBR",
    dominance:  65,
    medals: [{ country: "GBR", pct: 65 }, { country: "FRA", pct: 35 }],
    disappeared: "Never returned after Paris. Too British for a global Games.",
    fact:       "The only Olympic cricket match ever played lasted two days.",
    color:      "--ring-blue",
  },
  {
    sport:      "Croquet",
    years:      "1900",
    first:      1900,
    last:       1900,
    editions:   1,
    dominant:   "FRA",
    dominance:  100,
    medals: [{ country: "FRA", pct: 100 }],
    disappeared: "France won every medal. The sport was never invited back.",
    fact:       "All competitors were French. The only 'international' event with zero international competition.",
    color:      "--ring-green",
  },
  {
    sport:      "Motorboating",
    years:      "1908",
    first:      1908,
    last:       1908,
    editions:   1,
    dominant:   "GBR",
    dominance:  86,
    medals: [{ country: "GBR", pct: 86 }, { country: "FRA", pct: 14 }],
    disappeared: "Weather conditions cancelled most races. The IOC quietly removed it.",
    fact:       "Competed in the Solent, off the Isle of Wight. Most races were abandoned due to fog.",
    color:      "--ring-red",
  },
  {
    sport:      "Racquets",
    years:      "1908",
    first:      1908,
    last:       1908,
    editions:   1,
    dominant:   "GBR",
    dominance:  100,
    medals: [{ country: "GBR", pct: 100 }],
    disappeared: "A precursor to squash, played only in England. Never exported.",
    fact:       "All 7 competitors were British. The sport barely existed outside of London clubs.",
    color:      "--ring-blue",
  },
  {
    sport:      "Tug-Of-War",
    years:      "1900–1920",
    first:      1900,
    last:       1920,
    editions:   5,
    dominant:   "GBR",
    dominance:  42,
    medals: [{ country: "GBR", pct: 42 }, { country: "USA", pct: 28 }, { country: "NED", pct: 18 }, { country: "BEL", pct: 12 }],
    disappeared: "Dropped in 1920 as the Games modernised. Still has a World Championship.",
    fact:       "In 1900, a combined team of Danish and Swedish athletes won gold as a unified Scandinavian squad.",
    color:      "--ring-yellow",
  },
  {
    sport:      "Rugby",
    years:      "1900–1924",
    first:      1900,
    last:       1924,
    editions:   4,
    dominant:   "FRA",
    dominance:  30,
    medals: [{ country: "FRA", pct: 30 }, { country: "USA", pct: 22 }, { country: "GBR", pct: 15 }, { country: "ANZ", pct: 15 }],
    disappeared: "Dropped in 1924 due to lack of international participation. Returned as Rugby Sevens in 2016.",
    fact:       "The USA is the reigning Olympic Rugby champion — they won gold in 1924 and it was never contested again.",
    color:      "--ring-red",
  },
  {
    sport:      "Polo",
    years:      "1900–1936",
    first:      1900,
    last:       1936,
    editions:   5,
    dominant:   "GBR",
    dominance:  46,
    medals: [{ country: "GBR", pct: 46 }, { country: "USA", pct: 17 }, { country: "ARG", pct: 14 }, { country: "MEX", pct: 11 }],
    disappeared: "Too expensive. Too elitist. Too few countries could compete.",
    fact:       "Argentina's team in 1936 included four brothers from the Andrada family competing simultaneously.",
    color:      "--ring-yellow",
  },
  {
    sport:      "Basque Pelota",
    years:      "1900",
    first:      1900,
    last:       1900,
    editions:   1,
    dominant:   "ESP",
    dominance:  100,
    medals: [{ country: "ESP", pct: 100 }],
    disappeared: "Spain won everything. The sport was never added to the permanent programme.",
    fact:       "Spain holds 100% of all Olympic Basque Pelota medals. The only country ever to compete.",
    color:      "--ring-red",
  },
  {
    sport:      "Jeu De Paume",
    years:      "1908",
    first:      1908,
    last:       1908,
    editions:   1,
    dominant:   "GBR",
    dominance:  67,
    medals: [{ country: "GBR", pct: 67 }, { country: "USA", pct: 33 }],
    disappeared: "The ancient precursor to tennis. Had fewer than 50 practitioners worldwide by 1908.",
    fact:       "Real tennis — played indoors on an asymmetric court — is one of the oldest racket sports in existence.",
    color:      "--ring-blue",
  },
  {
    sport:      "Art Competitions",
    years:      "1912–1952",
    first:      1912,
    last:       1952,
    editions:   6,
    dominant:   "ITA",
    dominance:  18,
    medals: [{ country: "ITA", pct: 18 }, { country: "GER", pct: 15 }, { country: "FRA", pct: 13 }, { country: "HUN", pct: 12 }],
    disappeared: "Removed when the IOC ruled that professional artists could not compete in an amateur Games.",
    fact:       "Athletes could win gold medals for painting, sculpture, architecture, and music — all inspired by sport.",
    color:      "--ring-green",
  },
  {
    sport:      "Firefighting",
    years:      "1900",
    first:      1900,
    last:       1900,
    editions:   1,
    dominant:   "FRA",
    dominance:  100,
    medals: [{ country: "FRA", pct: 100 }],
    disappeared: "Held as a demonstration event at Paris 1900. Never returned.",
    fact:       "Firemen competed in teams racing to extinguish fires. Possibly the most practical Olympic event ever held.",
    color:      "--ring-red",
  },
  {
    sport:      "Softball",
    years:      "1996–2008",
    first:      1996,
    last:       2008,
    editions:   4,
    dominant:   "USA",
    dominance:  33,
    medals: [{ country: "USA", pct: 33 }, { country: "AUS", pct: 27 }, { country: "JPN", pct: 27 }],
    disappeared: "Removed in 2005 by IOC vote. Too American. Returned for Tokyo 2020 as a one-off.",
    fact:       "The USA won gold in every edition it was contested — 1996, 2000, 2004. Then it disappeared.",
    color:      "--ring-blue",
  },
]
```

---

## ICONOS SVG POR DEPORTE

Iconos finales, listos para usar inline en el HTML. Todos comparten:
`viewBox="0 0 48 48"`, `fill="none"`, `stroke="currentColor"`,
`stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
El color se controla con CSS `color` en el elemento padre.

```html
<!-- Cricket -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="16" cy="10" r="3"/>
  <path d="M14 13l-2 6 4 6"/>
  <path d="M16 19l6 6"/>
  <path d="M20 25l10-10"/>
  <rect x="30" y="14" width="2" height="12" rx="1"/>
  <circle cx="36" cy="28" r="2"/>
</svg>

<!-- Croquet -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="20" cy="10" r="3"/>
  <path d="M18 13l-2 8 4 6"/>
  <path d="M20 21l6 8"/>
  <path d="M26 29l6-12"/>
  <path d="M30 17h6"/>
  <path d="M32 30a4 4 0 0 0 6 0"/>
  <circle cx="26" cy="32" r="2"/>
</svg>

<!-- Motorboating -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="18" cy="12" r="3"/>
  <path d="M16 15l4 6 6 2"/>
  <path d="M10 28h26l4-4h-18z"/>
  <path d="M8 32c4 2 8 2 12 0s8-2 12 0"/>
</svg>

<!-- Racquets -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="20" cy="10" r="3"/>
  <path d="M18 13l2 8 6 6"/>
  <ellipse cx="30" cy="18" rx="6" ry="8"/>
  <path d="M30 26v8"/>
  <circle cx="40" cy="20" r="2"/>
</svg>

<!-- Tug-Of-War -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="10" cy="14" r="2"/>
  <circle cx="38" cy="14" r="2"/>
  <path d="M8 16l4 6"/>
  <path d="M40 16l-4 6"/>
  <path d="M6 24h36"/>
  <path d="M12 22l4 4"/>
  <path d="M36 22l-4 4"/>
</svg>

<!-- Rugby -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="20" cy="10" r="3"/>
  <path d="M18 13l-2 6 6 6"/>
  <path d="M22 19l8 2"/>
  <ellipse cx="30" cy="22" rx="6" ry="3"/>
</svg>

<!-- Polo -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="22" cy="10" r="3"/>
  <path d="M20 13l4 6"/>
  <path d="M24 19l6 2"/>
  <path d="M12 28c6-6 16-6 22 0"/>
  <path d="M18 28l-4 4"/>
  <path d="M28 28l4 4"/>
  <path d="M30 12v12"/>
  <path d="M30 12h6"/>
  <circle cx="38" cy="30" r="2"/>
</svg>

<!-- Basque Pelota -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="20" cy="10" r="3"/>
  <path d="M18 13l-2 6 6 6"/>
  <path d="M22 19l10 2"/>
  <path d="M30 22c4 0 6 4 2 6"/>
  <circle cx="40" cy="18" r="2"/>
</svg>

<!-- Jeu De Paume -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="20" cy="10" r="3"/>
  <path d="M18 13l-2 6 6 6"/>
  <path d="M22 19l8-2"/>
  <circle cx="34" cy="18" r="2"/>
</svg>

<!-- Art Competitions -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 12c8 0 14 6 14 12s-6 12-14 12c-4 0-6-2-6-4s2-4 6-4h2"/>
  <circle cx="24" cy="18" r="1"/>
  <circle cx="28" cy="22" r="1"/>
  <circle cx="22" cy="24" r="1"/>
  <path d="M30 30l6 6"/>
</svg>

<!-- Firefighting -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="18" cy="12" r="3"/>
  <path d="M16 15l-2 6 4 6"/>
  <path d="M20 21l6 6"/>
  <path d="M24 27l6-4"/>
  <path d="M30 23c4-6 6-10 0-14 0 4-4 6-4 10"/>
</svg>

<!-- Softball -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="24" cy="24" r="14"/>
  <path d="M16 18c4 2 4 10 0 12"/>
  <path d="M32 18c-4 2-4 10 0 12"/>
</svg>
```

### Cómo referenciarlos en data.js

Añade una propiedad `iconKey` a cada objeto del dataset para que
`main.js` sepa qué icono renderizar en cada tarjeta:

```js
{ sport: "Cricket",      iconKey: "cricket",      ... }
{ sport: "Croquet",      iconKey: "croquet",      ... }
{ sport: "Motorboating", iconKey: "motorboating", ... }
{ sport: "Racquets",     iconKey: "racquets",     ... }
{ sport: "Tug-Of-War",   iconKey: "tug-of-war",   ... }
{ sport: "Rugby",        iconKey: "rugby",         ... }
{ sport: "Polo",         iconKey: "polo",          ... }
{ sport: "Basque Pelota",iconKey: "basque-pelota", ... }
{ sport: "Jeu De Paume", iconKey: "jeu-de-paume",  ... }
{ sport: "Art Competitions", iconKey: "art",       ... }
{ sport: "Firefighting", iconKey: "firefighting",  ... }
{ sport: "Softball",     iconKey: "softball",      ... }
```

En `main.js`, los iconos se guardan en un objeto y se inyectan
con `innerHTML` al construir cada tarjeta:

```js
const icons = {
  'cricket':       `<svg viewBox="0 0 48 48" ...> ... </svg>`,
  'polo':          `<svg viewBox="0 0 48 48" ...> ... </svg>`,
  // ...
}

function renderCard(sport) {
  card.querySelector('.sport-icon').innerHTML = icons[sport.iconKey]
}
```

---

## BARRA DE VIDA (lifecycle bar)

Barra horizontal que muestra el periodo de vida del deporte dentro
del espectro 1896–2024. Se implementa como SVG inline.

```
1896  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2024
             ████████████  (años activos, --gold)
           1900        1936
```

```js
function renderLifeBar(sport, containerWidth) {
  const totalSpan = 2024 - 1896  // 128 años
  const xStart = ((sport.first - 1896) / totalSpan) * containerWidth
  const xEnd   = ((sport.last  - 1896) / totalSpan) * containerWidth

  // Fondo gris total
  svg.append('rect').attr('x', 0).attr('width', containerWidth)
     .attr('height', 3).attr('fill', '#3a3a3a')

  // Años activos en dorado
  svg.append('rect').attr('x', xStart).attr('width', xEnd - xStart)
     .attr('height', 3).attr('fill', '#C9A84C')
}
```

---

## COPY DE LA PÁGINA

### Hero
```
Número:    03 / LOST SPORTS
Título:    FORGOTTEN / BY THE GAMES
Dato:      32 sports removed from the Olympic programme since 1900.
Sub:       Some for good reasons. Some for no reason at all.
CTA:       SCROLL TO DISCOVER ↓
```

### Texto introductorio (bajo el hero, antes del primer filtro)
```
The Olympic programme is not permanent.
Since the first modern Games in Athens 1896, 32 sports have been added —
and quietly removed. Some lasted a single afternoon.
Some lasted decades. All of them were, briefly, Olympic.
```
Cormorant Garamond, 1.2rem, --muted, centrado, max-width 560px.

### Texto de cierre (al final del grid)
```
The IOC votes on the programme every four years.
The criteria: universality, youth appeal, TV audience.
What it leaves out: history, culture, and the sports
that didn't have a lobby powerful enough to survive.
```
Cormorant Garamond italic, 1.2rem, `#555555`, centrado, max-width 480px.

---

## ELEMENTOS GRÁFICOS NECESARIOS

Una sola imagen nueva. El resto reutiliza assets ya generados.

### Fondo del hero (`lostsports-hero.jpg`)

**Prompt Firefly:**
```
Collection of antique and vintage sports equipment arranged on aged dark
wood table surface, old cricket bat with cracked leather, worn polo mallet,
thick braided rope, antique racquet with wooden frame, all objects dusty
and forgotten, dramatic raking side light from the left creating long
shadows, black and white photography with single warm amber spotlight
on the rope, museum storage room aesthetic, high contrast still life,
extreme surface texture detail on wood grain and leather
```
- Content type: `Photo`
- Style: `Dark` + `Black and white` + `Vintage`
- Aspect ratio: `Widescreen 16:9`

---

## ORDEN DE IMPLEMENTACIÓN PARA COPILOT

```
1. HTML base + hero + copy introductorio             (verificar: hero visible)
2. Dataset en data.js                                (verificar: consola limpia)
3. Filter bar — HTML/CSS estático                    (verificar: botones se ven)
4. Línea de tiempo vertical — SVG D3                 (verificar: línea visible)
5. Tarjetas colapsadas — grid con animación entrada  (verificar: zigzag correcto)
6. Lifecycle bars — SVG por tarjeta                  (verificar: barras escaladas)
7. Iconos inline por deporte                         (verificar: iconos visibles)
8. Hover → iluminación + borde dorado                (verificar: transición suave)
9. Click → expansión con mini bar chart D3           (verificar: datos correctos)
10. Filtros de era → show/hide con GSAP              (verificar: transición fluida)
11. Scroll → punto activo en timeline se ilumina     (verificar: sincronización)
12. Responsivo móvil                                 (verificar: columna única)
```

---

## PROMPT INICIAL PARA COPILOT

```
Build Lost Sports page following this brief.
Stack: Vanilla JS + D3.js v7 (CDN) + GSAP 3 + ScrollTrigger (CDN).
Single HTML file with <style> and <script> tags.
Start with steps 1–3 only: full hero section with title "FORGOTTEN / BY THE GAMES",
introductory text block, sticky filter bar with 5 era filters (HTML and CSS only,
no JS yet), and the complete dataset inline as a const.
CSS variables: --bg: #0a0a0a, --white: #F5F2EB, --gold: #C9A84C,
--muted: #666666, --gray: #3a3a3a.
Fonts: Bebas Neue, Cormorant Garamond, DM Mono from Google Fonts CDN.
No explanations. Code only.
```
