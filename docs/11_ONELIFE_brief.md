# BRIEF — ONE LIFE, TEN GAMES
## Página interior · Olympic Data Stories
### Stack: Vanilla JS + D3.js v7 + GSAP 3 + CSS Custom Properties

---

## CONCEPTO

Visualización biográfica de los atletas que más Juegos Olímpicos han
disputado en la historia. El elemento emocional central no son las
medallas sino el tiempo: Ian Millar compitió durante 40 años, desde
Munich 1972 hasta Londres 2012. Paul Elvstrøm ganó 4 oros consecutivos
entre 1948 y 1960. Oksana Chusovitina compitió en gimnasia a los 46 años.

El gráfico principal es una línea de tiempo horizontal donde cada atleta
es una fila de puntos — uno por Olimpiada. Los puntos se colorean según
si ganó medalla ese año. Superpuestos verticalmente, los eventos históricos
mundiales dan contexto a esas vidas extraordinarias.

**Dato de impacto:** 40 años. La distancia entre la primera y última
Olimpiada de Ian Millar. En ese tiempo cayó el Muro de Berlín, se disolvió
la URSS y ocurrió el 11-S.

---

## ESTRUCTURA DE ARCHIVOS

```
one-life/
├── index.html
├── style.css
├── data.js       ← atletas + eventos históricos
└── main.js       ← initTimeline(), initAthleteDetail(), initFilters()
```

---

## FLUJO DE USUARIO

```
1. Llega → hero con dato de impacto ("40 years. One athlete.")
       ↓
2. Ve el gráfico de líneas de tiempo con todos los atletas
       ↓
3. Hover en un punto → tooltip con año + Olimpiada + medalla si la hay
       ↓
4. Click en una fila (atleta) → se expande mostrando biografía y detalle
       ↓
5. Toggle: filtrar por deporte o por número de ediciones
       ↓
6. Scroll horizontal en el gráfico para navegar los años
```

---

## LAYOUT GLOBAL

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (fixed, 60px)                                     │
├──────────────────────────────────────────────────────────┤
│ HERO (100vh)                                             │
│   Título + dato de impacto + instrucción                 │
├──────────────────────────────────────────────────────────┤
│ FILTER BAR (sticky)                                      │
│   [All] [Equestrian] [Sailing] [Shooting] [Other]        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ CHART — líneas de tiempo horizontales (D3, SVG)          │
│ · Eje X: años olímpicos 1948–2022                        │
│ · Cada fila: un atleta                                   │
│ · Eventos históricos: líneas verticales con label        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ATHLETE DETAIL PANEL (aparece al hacer click en una fila)│
└──────────────────────────────────────────────────────────┘
```

---

## SECCIÓN HERO (100vh)

```
[número]   04 / ONE LIFE, TEN GAMES     ← DM Mono 0.75rem --gold

[título]   ONE LIFE                     ← Bebas Neue 14vw --white
           TEN GAMES                    ← Bebas Neue 14vw --gold

[divisor]  ──────────────               ← 1px --gray, 160px centrado

[dato]     40                           ← Bebas Neue 7vw --white
           years between first          ← Cormorant italic 1.2rem --muted
           and last Olympic Games       ← Cormorant italic 1.2rem --muted

[sub]      One Canadian equestrian.     ← Cormorant italic 1rem #555
           Ten Olympic Games.           ← Cormorant italic 1rem #555
           One silver medal.            ← Cormorant italic 1rem --gold

[CTA]      EXPLORE THE LIVES ↓          ← DM Mono 0.75rem --muted
```

**Fondo hero:** `onelife-hero.jpg` al 20% de opacidad (ver sección assets).

**Elemento especial del hero:** foto de Ian Millar en plano 3/4 anclada
a la derecha del viewport, recortada verticalmente, con gradiente que
la desvanece hacia la izquierda:

```css
.hero-athlete-photo {
  position: absolute;
  right: 0; top: 0;
  height: 100vh;
  width: 45vw;
  object-fit: cover;
  object-position: center top;
  filter: grayscale(100%);
  mask-image: linear-gradient(to right, transparent 0%, black 40%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%);
  opacity: 0.35;
}
```

El texto del hero queda en la mitad izquierda. La figura del atleta
asoma desde la derecha, semitransparente, sin competir con el copy.

---

## FILTER BAR (sticky, top: 60px, altura 52px)

```
[ ALL · 17 ]  [ EQUESTRIAN · 4 ]  [ SAILING · 3 ]  [ SHOOTING · 4 ]  [ OTHER · 6 ]
```

Mismo sistema de botones pill que Body Atlas y Lost Sports.
Al filtrar: las filas inactivas hacen `opacity: 0.1` con GSAP 0.3s.

---

## GRÁFICO PRINCIPAL — Timeline horizontal (D3)

### Dimensiones y márgenes

```js
const margin = { top: 80, right: 40, bottom: 40, left: 200 }
// left: 200px para los nombres de los atletas
// top: 80px para los eventos históricos
```

### Eje X — años

```js
// Solo años olímpicos donde aparece algún atleta del dataset
const olympicYears = [
  1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
  1984, 1988, 1992, 1994, 1996, 1998, 2000, 2002, 2004,
  2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022
]

const xScale = d3.scalePoint()
  .domain(olympicYears)
  .range([0, chartWidth])
  .padding(0.5)
```

Los años de invierno (1994, 1998...) se muestran en un tono más claro
para distinguirlos visualmente de los de verano.

### Filas de atletas

Cada atleta es una fila horizontal con tres zonas:

```
┌────────────────────┬──────────────────────────────────────────┐
│  FOTO + NOMBRE     │  LÍNEA DE TIEMPO CON PUNTOS              │
│  (izq, 200px)      │  (derecha, resto del ancho)              │
└────────────────────┴──────────────────────────────────────────┘
```

**Zona izquierda (fuera del SVG, HTML puro):**
- Foto del atleta: 36×36px, circular, `border-radius: 50%`,
  `filter: grayscale(100%)`, `border: 1px solid #3a3a3a`
- Nombre: DM Mono 0.7rem, --muted, alineado derecha, una línea
- Al hacer hover en la fila: la foto pasa a `grayscale(0%)` en 0.3s
  y el borde cambia a `1px solid --gold`

```html
<!-- HTML por cada fila de atleta -->
<div class="athlete-row" data-id="ian-millar">
  <div class="athlete-label">
    <img src="assets/img/athletes/ian-millar.jpg"
         class="athlete-thumb" alt="Ian Millar">
    <span class="athlete-name">Ian Millar</span>
  </div>
  <svg class="athlete-timeline"><!-- D3 aquí --></svg>
</div>
```

```css
.athlete-thumb {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  filter: grayscale(100%);
  border: 1px solid #3a3a3a;
  transition: filter 0.3s ease, border-color 0.3s ease;
  flex-shrink: 0;
}
.athlete-row:hover .athlete-thumb {
  filter: grayscale(0%);
  border-color: #C9A84C;
}
```

**Zona derecha (SVG D3):**
- Línea horizontal fina `1px #3a3a3a` conectando todos sus puntos
- Puntos en cada año que participó

```js
// Línea de conexión entre puntos
svg.append('line')
  .attr('x1', xScale(athlete.years[0]))
  .attr('x2', xScale(athlete.years[athlete.years.length - 1]))
  .attr('y1', yPos).attr('y2', yPos)
  .attr('stroke', '#3a3a3a').attr('stroke-width', 1)
```

### Sistema de colores de los puntos

```js
// Radio base por tipo
const pointRadius = {
  gold:          8,   // medalla de oro
  silver:        7,   // medalla de plata
  bronze:        6,   // medalla de bronce
  participation: 4,   // participación sin medalla
}

// Color por tipo
const pointColor = {
  gold:          '#C9A84C',   // dorado olímpico
  silver:        '#C0C0C0',   // plata
  bronze:        '#CD7F32',   // bronce
  participation: '#3a3a3a',   // gris — solo outline, fill transparente
}
```

Los puntos de participación tienen `fill: transparent` y
`stroke: #3a3a3a` — son círculos vacíos. Solo las medallas son sólidas.

### Animación de entrada

Al cargar el gráfico, los puntos de cada fila aparecen de izquierda
a derecha con stagger:

```js
// Por cada atleta, los puntos entran con delay proporcional al año
points.transition()
  .delay((d, i) => i * 80)
  .duration(400)
  .attr('r', d => pointRadius[d.type])
  .attr('opacity', 1)
```

### Hover en un punto

Al hacer `mouseover` en cualquier punto:

```
┌───────────────────────────────┐
│ ATHENS 2004          ← DM Mono 0.65rem --gold
│ ───────────────────
│ ANDREW HOY           ← Bebas Neue 1.4rem --white
│ Equestrian Eventing  ← DM Mono 0.7rem --muted
│                      
│ ● SILVER — Team      ← color plata + DM Mono 0.75rem
└───────────────────────────────┘
```

Si es participación sin medalla:
```
│ — No medal this edition
```

### Click en una fila → selección del atleta

Al hacer click en el nombre o en la línea de un atleta:
- La fila se ilumina: la línea pasa de `#3a3a3a` a `--gold`
- El resto de filas bajan a `opacity: 0.2`
- Se abre el panel de detalle (ver sección siguiente)

---

## EVENTOS HISTÓRICOS (anotaciones verticales)

Líneas verticales finas sobre el gráfico que contextualizan los años.

```js
const historicalEvents = [
  { year: 1948, label: "Post-WWII Games",         align: "right" },
  { year: 1968, label: "Mexico protests",          align: "right" },
  { year: 1972, label: "Munich massacre",          align: "right" },
  { year: 1980, label: "USA boycott",              align: "right" },
  { year: 1984, label: "USSR boycott",             align: "left"  },
  { year: 1988, label: "Last Cold War Games",      align: "right" },
  { year: 1989, label: "Berlin Wall falls",        align: "right", noGame: true },
  { year: 1992, label: "USSR dissolved",           align: "right" },
  { year: 2001, label: "9/11",                     align: "right", noGame: true },
  { year: 2020, label: "Covid Games",              align: "right" },
]
```

Estilo de las anotaciones:
- Línea: `1px dashed #3a3a3a`, altura total del gráfico
- Label: DM Mono 0.6rem, `#444444`, rotado -90°, arriba de la línea
- Los eventos sin Juegos (`noGame: true`) tienen la línea en `--ring-red`
  opacity 0.3 para distinguirlos

---

## PANEL DE DETALLE DEL ATLETA

Se activa al hacer click en una fila. Aparece debajo del gráfico
(no lateral — el gráfico es horizontal y necesita todo el ancho).

Animación: `height: 0 → auto`, GSAP 0.5s `power2.out`.

### Estructura del panel

El panel tiene **dos columnas**: foto grande a la izquierda, datos a la derecha.

```
┌───────────────────────────────────────────────────────────────┐
│  [X cerrar]                                                   │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─────────────────┐  ┌────────────────────────────────────┐  │
│  │                 │  │  IAN MILLAR         CAN            │  │
│  │  FOTO 3/4       │  │  Equestrian Jumping                │  │
│  │  del atleta     │  │  ─────────────────────────────     │  │
│  │                 │  │                                    │  │
│  │  220×300px      │  │  EDITIONS  SPAN  MEDALS            │  │
│  │  grayscale      │  │     10      40yr    1              │  │
│  │  hover = color  │  │                                    │  │
│  │                 │  │  ─────────────────────────────     │  │
│  │                 │  │  [mini timeline del atleta]        │  │
│  │                 │  │                                    │  │
│  │                 │  │  ─────────────────────────────     │  │
│  │                 │  │  [texto biográfico]                │  │
│  │                 │  │                                    │  │
│  │                 │  │  [nota especial en --gold]         │  │
│  └─────────────────┘  └────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Foto en el panel

```css
.panel-athlete-photo {
  width: 220px;
  height: 300px;
  object-fit: cover;
  object-position: center top;  /* prioriza cara y torso */
  filter: grayscale(100%);
  border: 1px solid #3a3a3a;
  transition: filter 0.4s ease;
  flex-shrink: 0;
}
.panel-athlete-photo:hover {
  filter: grayscale(0%);        /* color al hover */
  cursor: zoom-in;
}
```

Borde izquierdo del contenedor de foto: `3px solid --gold`.
Fondo detrás de la foto: `--bg-card` (#161616).

### Fallback si no hay foto

```css
.panel-photo-placeholder {
  width: 220px; height: 300px;
  background: #161616;
  border: 1px solid #3a3a3a;
  border-left: 3px solid #C9A84C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue';
  font-size: 4rem;
  color: #C9A84C;
  letter-spacing: 0.05em;
}
/* Mostrar iniciales: "IM" para Ian Millar */
```

### Fila de stats (columna derecha)

```
EDITIONS    ← DM Mono 0.65rem --muted
  10        ← Bebas Neue 3vw --white

YEARS SPAN
  40        ← Bebas Neue 3vw --gold  (el más destacado)

MEDALS
   1        ← Bebas Neue 3vw --white

FIRST GAME
  1972      ← Bebas Neue 2vw --white
  Munich    ← DM Mono 0.65rem --muted

LAST GAME
  2012      ← Bebas Neue 2vw --white
  London    ← DM Mono 0.65rem --muted
```

### Mini timeline en el panel

Versión ampliada de la fila del atleta, solo sus años, más espaciada.
Los puntos son más grandes (r × 1.8) y tienen labels de año encima.
Las medallas muestran el evento específico al hacer hover.

---

## DATASET (data.js)

```js
export const athletes = [
  {
    id:       "ian-millar",
    name:     "Ian Millar",
    country:  "CAN",
    sport:    "Equestrian Jumping",
    category: "equestrian",
    editions: 10,
    span:     40,
    years:    [1972, 1976, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [
      { year: 2008, type: "silver", event: "Team, Open" }
    ],
    bio: "The most decorated Olympic equestrian career in history. Ian Millar competed for Canada across five decades, missing only Moscow 1980 due to the boycott. He was 65 years old at his final Games in London 2012.",
    note: "Missed 1980 — Canada boycotted the Moscow Games."
  },
  {
    id:       "hubert-raudaschl",
    name:     "Hubert Raudaschl",
    country:  "AUT",
    sport:    "Sailing",
    category: "sailing",
    editions: 9,
    span:     32,
    years:    [1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996],
    medals: [
      { year: 1968, type: "silver", event: "One Person Dinghy, Open" },
      { year: 1980, type: "silver", event: "Two Person Keelboat, Open" }
    ],
    bio: "Nine consecutive Olympic Games from Tokyo 1964 to Atlanta 1996. The Austrian sailor competed through boycotts, political storms, and three decades of changing equipment. Two silvers, but the record for most Olympic sailing appearances ever set.",
    note: "Competed in both the 1980 and 1984 boycott Games."
  },
  {
    id:       "afanasijs-kuzmins",
    name:     "Afanasijs Kuzmins",
    country:  "LAT",
    sport:    "Shooting",
    category: "shooting",
    editions: 9,
    span:     36,
    years:    [1976, 1980, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [
      { year: 1988, type: "gold",   event: "Rapid-Fire Pistol, 25m, Men" },
      { year: 1992, type: "silver", event: "Rapid-Fire Pistol, 25m, Men" }
    ],
    bio: "Competed first for the Soviet Union, then as an independent after Latvia regained independence. His career spans the Cold War, its end, and the birth of a new nation. Gold in Seoul 1988, silver in Barcelona 1992.",
    note: "Competed as USSR (1976–1988) then as independent Latvia."
  },
  {
    id:       "nino-salukvadze",
    name:     "Nino Salukvadze",
    country:  "GEO",
    sport:    "Shooting",
    category: "shooting",
    editions: 9,
    span:     32,
    years:    [1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals: [
      { year: 1988, type: "gold",   event: "Sporting Pistol, 25m, Women" },
      { year: 1988, type: "silver", event: "Air Pistol, 10m, Women" },
      { year: 2008, type: "bronze", event: "Air Pistol, 10m, Women" }
    ],
    bio: "Two medals in Seoul 1988 at age 17. A bronze in Beijing 2008 — twenty years later. Nino Salukvadze is the only woman in Olympic history to have won medals in four different decades of competition.",
    note: "At Tokyo 2020, she carried Georgia's flag at the Opening Ceremony."
  },
  {
    id:       "josefa-idem-guerrini",
    name:     "Josefa Idem-Guerrini",
    country:  "ITA",
    sport:    "Canoe Sprint",
    category: "other",
    editions: 8,
    span:     28,
    years:    [1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [
      { year: 1984, type: "bronze", event: "Kayak Doubles, 500m, Women" },
      { year: 1996, type: "bronze", event: "Kayak Singles, 500m, Women" },
      { year: 2000, type: "gold",   event: "Kayak Singles, 500m, Women" },
      { year: 2004, type: "silver", event: "Kayak Singles, 500m, Women" },
      { year: 2008, type: "silver", event: "Kayak Singles, 500m, Women" }
    ],
    bio: "Born in Germany, competed for Italy after marrying an Italian coach. Five Olympic medals across 24 years. Her gold in Sydney 2000 came 16 years after her first Olympic appearance.",
    note: "Competed for West Germany (1984) then Italy (1988–2012)."
  },
  {
    id:       "andrew-hoy",
    name:     "Andrew Hoy",
    country:  "AUS",
    sport:    "Equestrian Eventing",
    category: "equestrian",
    editions: 8,
    span:     36,
    years:    [1984, 1988, 1992, 1996, 2000, 2004, 2012, 2020],
    medals: [
      { year: 1992, type: "gold",   event: "Team, Open" },
      { year: 1996, type: "gold",   event: "Team, Open" },
      { year: 2000, type: "gold",   event: "Team, Open" },
      { year: 2000, type: "silver", event: "Individual, Open" },
      { year: 2020, type: "silver", event: "Team, Open" },
      { year: 2020, type: "bronze", event: "Individual, Open" }
    ],
    bio: "Three consecutive team golds from 1992 to 2000. Then a 16-year gap, a comeback at 62, and two more medals in Tokyo 2020. Andrew Hoy is the only Olympic equestrian with medals in both the 1990s and 2020s.",
    note: "Returned from retirement for Tokyo 2020 aged 62."
  },
  {
    id:       "paul-elvstrom",
    name:     "Paul Elvstrøm",
    country:  "DEN",
    sport:    "Sailing",
    category: "sailing",
    editions: 8,
    span:     40,
    years:    [1948, 1952, 1956, 1960, 1968, 1972, 1984, 1988],
    medals: [
      { year: 1948, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1952, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1956, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1960, type: "gold", event: "One Person Dinghy, Open" }
    ],
    bio: "Four consecutive gold medals from London 1948 to Rome 1960. Then retirement, a long absence, and two more Games in 1984 and 1988 — competing alongside his daughter Trine. One of the greatest sailors in Olympic history.",
    note: "Competed with his daughter Trine in Los Angeles 1984 and Seoul 1988."
  },
  {
    id:       "oksana-chusovitina",
    name:     "Oksana Chusovitina",
    country:  "GER",
    sport:    "Artistic Gymnastics",
    category: "other",
    editions: 8,
    span:     28,
    years:    [1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals: [
      { year: 1992, type: "gold",   event: "Team All-Around, Women" },
      { year: 2008, type: "silver", event: "Horse Vault, Women" }
    ],
    bio: "At Tokyo 2020, Oksana Chusovitina competed in artistic gymnastics at age 46 — an event dominated by teenagers. Her first Olympic gold came in 1992 when most of her Tokyo competitors hadn't been born yet.",
    note: "Competed for USSR (1992), Uzbekistan (1996–2006) and Germany (2008–2020)."
  },
  {
    id:       "claudia-pechstein",
    name:     "Claudia Pechstein",
    country:  "GER",
    sport:    "Speed Skating",
    category: "other",
    editions: 8,
    span:     30,
    years:    [1992, 1994, 1998, 2002, 2006, 2014, 2018, 2022],
    medals: [
      { year: 1992, type: "bronze", event: "5,000m, Women" },
      { year: 1994, type: "gold",   event: "5,000m, Women" },
      { year: 1994, type: "bronze", event: "3,000m, Women" },
      { year: 1998, type: "gold",   event: "5,000m, Women" },
      { year: 1998, type: "silver", event: "3,000m, Women" },
      { year: 2002, type: "gold",   event: "3,000m, Women" },
      { year: 2002, type: "gold",   event: "5,000m, Women" },
      { year: 2006, type: "gold",   event: "Team Pursuit, Women" },
      { year: 2006, type: "silver", event: "5,000m, Women" }
    ],
    bio: "Nine Olympic medals across four decades. Banned for two years in 2009 after a disputed doping case — later cleared. Returned at 42 for PyeongChang 2018, and again at 50 for Beijing 2022.",
    note: "Returned at age 50 for Beijing 2022. The oldest German Winter Olympian ever."
  },
  {
    id:       "jesus-angel-garcia",
    name:     "Jesús Ángel García",
    country:  "ESP",
    sport:    "Athletics",
    category: "other",
    editions: 8,
    span:     28,
    years:    [1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals:   [],
    bio: "Eight consecutive Olympic Games in race walking. Zero medals. The Spanish athlete competed in every Games from Barcelona 1992 to Tokyo 2020 — 28 years, home Games to pandemic Games, always without a podium.",
    note: "Competed in Barcelona 1992 — his home Games — aged 23. Last competed in Tokyo 2020 aged 51."
  },
]

export const historicalEvents = [
  { year: 1948, label: "Post-WWII Games"      },
  { year: 1968, label: "Mexico protests"       },
  { year: 1972, label: "Munich massacre"       },
  { year: 1980, label: "USA boycott"           },
  { year: 1984, label: "USSR boycott"          },
  { year: 1988, label: "Last Cold War Games"   },
  { year: 1992, label: "USSR dissolved"        },
  { year: 2001, label: "9/11",   noGame: true  },
  { year: 2020, label: "Covid Games"           },
]

export const olympicCities = {
  1948: "London",    1952: "Helsinki",  1956: "Melbourne",
  1960: "Rome",      1964: "Tokyo",     1968: "Mexico City",
  1972: "Munich",    1976: "Montreal",  1980: "Moscow",
  1984: "Los Angeles", 1988: "Seoul",   1992: "Barcelona",
  1994: "Lillehammer",1996: "Atlanta",  1998: "Nagano",
  2000: "Sydney",    2002: "Salt Lake", 2004: "Athens",
  2006: "Turin",     2008: "Beijing",   2010: "Vancouver",
  2012: "London",    2014: "Sochi",     2016: "Rio",
  2018: "PyeongChang", 2020: "Tokyo",  2022: "Beijing",
}
```

---

## COPY DE LA PÁGINA

### Hero
```
Número:  04 / ONE LIFE, TEN GAMES
Título:  ONE LIFE / TEN GAMES
Dato:    40 years between first and last Olympic Games
Sub:     One Canadian equestrian. Ten Olympic Games. One silver medal.
CTA:     EXPLORE THE LIVES ↓
```

### Texto introductorio (bajo el filtro, sobre el gráfico)
```
Some athletes come for one Games and never return.
These ones never left.
Each dot is an Olympic appearance. Each gap is four years of a life.
The gold ones are the moments they stood on a podium.
```
Cormorant Garamond italic, 1.1rem, `#666666`, centrado, max-width 520px.

### Textos de nota especial (sobre el gráfico, en el año correspondiente)

Pequeñas etiquetas flotantes sobre eventos específicos del dataset:

```
1992 → "Oksana's first gold. She was 17."       (sobre el punto de Chusovitina)
2020 → "Oksana's last Games. She was 46."       (sobre el punto de Chusovitina)
1988 → "The Cold War's last Games"              (línea vertical de evento)
2022 → "Claudia Pechstein, age 50"              (sobre el punto final de Pechstein)
```

Estilo: DM Mono 0.6rem, `#555555`, máximo 2 líneas.

### Texto de cierre
```
Forty years is not a career.
It is a life measured in four-year intervals,
in the rhythm of cities and anthems and flags
that sometimes change between editions.

These athletes did not just compete in the Olympics.
They grew old inside them.
```
Cormorant Garamond italic, 1.3rem, `#666666`, centrado, max-width 480px.

---

## ELEMENTOS GRÁFICOS NECESARIOS

```
/assets/img/
├── onelife-hero.jpg              ← fondo del hero (ver prompt Gemini abajo)
├── onelife-bg-texture.jpg        ← textura para el fondo del gráfico (ver abajo)
└── athletes/
    ├── ian-millar.jpg            ← foto 3/4, ya disponible
    ├── hubert-raudaschl.jpg
    ├── afanasijs-kuzmins.jpg
    ├── nino-salukvadze.jpg
    ├── josefa-idem-guerrini.jpg
    ├── andrew-hoy.jpg
    ├── paul-elvstrom.jpg
    ├── oksana-chusovitina.jpg
    ├── claudia-pechstein.jpg
    └── jesus-angel-garcia.jpg
```

Preprocesar todas las fotos antes de integrarlas:
- Recortar a 220×300px (plano 3/4, cara y torso visibles)
- Guardar en JPG calidad 85
- El filtro grayscale se aplica en CSS, no en el archivo

### Añadir propiedad `photo` al dataset

```js
// En cada objeto atleta de data.js:
{ id: "ian-millar", ..., photo: "assets/img/athletes/ian-millar.jpg" }
{ id: "paul-elvstrom", ..., photo: "assets/img/athletes/paul-elvstrom.jpg" }
// etc.
```

---

## PROMPTS GEMINI PARA IMÁGENES DE FONDO

### Fondo hero (`onelife-hero.jpg`) — uso: 20% opacity

```
Empty Olympic podium photographed from the side at ground level,
dark concrete stadium in background completely out of focus,
a single worn athletic shoe resting on the gold step,
dramatic low side lighting casting long shadows across the three steps,
black and white photography with only the gold step surface rendered
in warm amber light, dust particles visible in the light beam,
cinematic still life, no people, powerful sense of absence and time passed,
widescreen backdrop 16:9
```
- Relación de aspecto: Panorámico 16:9

Versión alternativa:
```
Multiple Olympic medals from different eras arranged in a chronological
row on dark stone surface, oldest medals on the left progressively more
modern to the right, each medal slightly different in design,
dramatic single overhead spotlight, black and white photography
with warm gold light only on the medals, extreme close-up,
museum display aesthetic, no people, widescreen 16:9
```

### Textura de fondo del gráfico (`onelife-bg-texture.jpg`) — uso: 4% opacity

```
Extreme close-up of aged athletic track rubber surface texture,
dark gray granular material with fine grain pattern,
completely flat overhead shot with no depth of field,
uniform studio lighting with no shadows, seamless tileable surface,
no color, dark gray and black tones only, square format 1:1
```
- Relación de aspecto: Cuadrado 1:1 ← para tilear

---

## ORDEN DE IMPLEMENTACIÓN PARA COPILOT

```
1. HTML base + hero (con foto Ian Millar a la derecha)    (verificar: hero visible)
2. Dataset en data.js con propiedad photo                 (verificar: consola limpia)
3. Filter bar — HTML/CSS estático                         (verificar: botones se ven)
4. Gráfico D3 base — eje X + filas HTML con foto+nombre   (verificar: estructura)
5. Puntos D3 por año — coloreados según tipo              (verificar: gold/silver)
6. Líneas de conexión entre puntos                        (verificar: líneas visibles)
7. Eventos históricos — líneas verticales + labels        (verificar: alineadas)
8. Animación entrada puntos (stagger)                     (verificar: suave)
9. Hover fila → foto a color + borde dorado               (verificar: transición)
10. Hover punto → tooltip                                 (verificar: contenido)
11. Click fila → panel con foto 3/4 + mini timeline       (verificar: abre/cierra)
12. Filtro por categoría → show/hide filas GSAP           (verificar: transición)
13. Notas especiales sobre puntos clave                   (verificar: visibles)
14. Responsivo móvil (scroll horizontal en gráfico)       (verificar: funciona)
```

---

## PROMPT INICIAL PARA COPILOT

```
Build One Life Ten Games page following this brief.
Stack: Vanilla JS + D3.js v7 (CDN) + GSAP 3 (CDN).
Single HTML file with <style> and <script> tags.
Start with steps 1–4 only:
- Hero section: text on the left half, athlete photo (ian-millar.jpg)
  on the right half fading left with CSS mask-image gradient,
  grayscale, opacity 0.35
- Filter bar HTML/CSS only
- Dataset as inline const including photo property per athlete
- Chart base: HTML rows with 36px circular thumbnail + name on the left,
  D3 SVG timeline on the right. X axis with Olympic years, horizontal
  lines per athlete. No dots yet, no interactivity yet.
CSS variables: --bg: #0a0a0a, --white: #F5F2EB, --gold: #C9A84C,
--muted: #666666, --gray: #3a3a3a.
Fonts: Bebas Neue, Cormorant Garamond, DM Mono from Google Fonts CDN.
No explanations. Code only.
```
