# DESIGN BRIEF — Olympic Cold War Visualization
## Instrucciones de diseño para Cursor

---

## CONCEPTO GENERAL

Web de una sola página tipo **scrollytelling editorial** que narra la guerra fría entre USA y la URSS/Rusia a través de las medallas de oro olímpicas desde 1896 hasta 2024.

El tono visual es **editorial de lujo deportivo**: serio, monumental, dramático. Similar a obys.agency pero aplicado a datos históricos. Cada sección se descubre al hacer scroll y los gráficos se animan al entrar en viewport.

---

## PALETA DE COLORES

```css
:root {
  /* Base */
  --color-bg:         #0a0a0a;   /* negro casi puro — fondo principal */
  --color-bg-alt:     #111111;   /* negro ligeramente más claro para secciones */
  --color-white:      #F5F2EB;   /* blanco cálido, no puro */
  --color-gray:       #3a3a3a;   /* gris para líneas divisorias */
  --color-muted:      #888888;   /* texto secundario */

  /* Acento principal */
  --color-gold:       #C9A84C;   /* dorado olímpico, medalla de oro */
  --color-gold-light: #E8C96A;   /* dorado claro para hovers y brillos */
  --color-gold-dark:  #8B6914;   /* dorado oscuro para sombras */

  /* Colores de los aros olímpicos — usar con moderación, solo para acentos */
  --ring-blue:        #0085C7;
  --ring-yellow:      #F4C300;
  --ring-black:       #000000;
  --ring-green:       #009F6B;
  --ring-red:         #DF0024;

  /* Datos / Visualización */
  --color-usa:        #B22234;   /* rojo USA */
  --color-ussr:       #CC0000;   /* rojo URSS */
  --color-russia:     #CC2244;   /* rojo Rusia post-URSS */
  --color-neutral:    #3a3a3a;   /* años sin datos o neutrales */
}
```

---

## TIPOGRAFÍA

```css
/* Importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-display:  'Bebas Neue', sans-serif;       /* titulares enormes, impacto */
  --font-body:     'Cormorant Garamond', serif;    /* cuerpo editorial, elegante */
  --font-data:     'DM Mono', monospace;           /* números, datos, años */
}
```

**Jerarquía tipográfica:**
- **Hero title**: `Bebas Neue`, 15–20vw, color `--color-white`, tracking muy abierto (`letter-spacing: 0.05em`)
- **Subtítulos de sección**: `Bebas Neue`, 5–8vw, color `--color-gold`
- **Cuerpo narrativo**: `Cormorant Garamond` 400, 1.2–1.5rem, color `#c8c8c8`, line-height 1.8
- **Cifras y años**: `DM Mono`, tamaños variables, color `--color-gold-light`
- **Labels y metadatos**: `DM Mono`, 0.7–0.8rem uppercase, `--color-muted`

---

## LAYOUT Y ESTRUCTURA DE SECCIONES

### Sección 0 — HERO
- Fondo negro 100vh
- Título enorme en dos líneas: `COLD WAR` / `IN GOLD`
- Debajo, en `Cormorant Garamond` italic: *"128 years. 2 superpowers. One scoreboard."*
- Número de años en esquina inferior derecha: `1896 — 2024` en DM Mono
- Animación de entrada: las letras del título caen una por una con stagger (0.05s entre cada letra)
- Cursor personalizado: un pequeño círculo dorado que sigue al ratón

### Sección 1 — CONTEXTO
- Layout asimétrico: texto a la izquierda (40%), espacio vacío a la derecha
- Párrafo introductorio de 3-4 líneas explicando el concepto
- Una línea horizontal fina dorada (`1px solid --color-gold`) que separa del resto
- Al hacer scroll, el texto se revela con un clip-path animado de abajo a arriba

### Sección 2 — TIMELINE PRINCIPAL (el gráfico core)
- Ocupa el 100% del viewport, sticky mientras el usuario scrollea
- Gráfico de líneas animado: USA en `--color-usa`, URSS/Rusia en `--color-ussr`
- Eje X: años (1952–2024, solo Juegos donde ambos participaron)
- Eje Y: número de oros
- Los dos grandes valles del boicot (1980, 1984) son el momento dramático clave:
  - En 1980: aparece texto flotante `"USA Boycott — 6 golds"` con línea conectora
  - En 1984: aparece texto flotante `"USSR Boycott — 6 golds"` con línea conectora
- Los puntos del gráfico son círculos con hover que muestra tooltip oscuro con año + oros
- El área bajo cada línea tiene fill semitransparente del color del país (opacity 0.08)
- Fondo de la sección: `--color-bg-alt`

### Sección 3 — NÚMEROS ÉPICOS
- Fila de 3 estadísticas en grande:
  - Total oros USA historicos — número enorme en Bebas Neue dorado
  - Total oros URSS — número enorme
  - Diferencia total — con signo + o −
- Los números se animan contando desde 0 cuando entran en viewport (IntersectionObserver)
- Separados por líneas verticales `1px solid --color-gray`

### Sección 4 — MOMENTOS CLAVE (tarjetas)
- 4–5 tarjetas horizontales que se deslizan con scroll horizontal (o apiladas en vertical en móvil)
- Cada tarjeta: año olímpico + ciudad + quién ganó la guerra ese año + delta de oros
- Fondo de tarjeta: `--color-bg-alt` con borde superior `2px` del color del ganador
- Las tarjetas más dramáticas (1980, 1984) tienen el borde dorado

### Sección 5 — POST COLD WAR
- Qué pasó después del 92: Rusia vs USA en la era moderna
- Mini gráfico de barras enfrentadas (USA vs RUS), años 1996–2024
- Texto narrativo lateral

### Sección 6 — FOOTER / CRÉDITOS
- Centrado, tipografía pequeña DM Mono
- `DATA SOURCE: OLYMPEDIA` y nombre del autor
- Los 5 aros olímpicos como decoración en SVG (pequeños, colores originales, opacity 0.3)

---

## ANIMACIONES Y MOTION

```text
Principios:
- Todo entra desde abajo o con fade, NUNCA desde los lados
- Duración estándar: 0.8s con easing cubic-bezier(0.16, 1, 0.3, 1)
- Stagger entre elementos: 0.08s
- El scroll es suave: scroll-behavior: smooth + posiblemente Lenis.js para inercia

Efectos específicos:
- Cursor personalizado: círculo de 20px dorado, mezcla con blend-mode: difference
- Números estadísticos: counter animation al entrar en viewport
- Líneas del gráfico: se dibujan de izquierda a derecha con stroke-dasharray/dashoffset
- Hover en puntos del gráfico: escala 1.5x + aparece tooltip
- Títulos de sección: clip-path reveal de abajo a arriba
- Números del hero: parallax sutil al hacer scroll (translateY a distinta velocidad)
```

---

## LIBRERÍAS RECOMENDADAS (todas gratuitas)

```html
<!-- D3.js para los gráficos -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>

<!-- GSAP para animaciones avanzadas (versión gratuita suficiente) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

<!-- Lenis para scroll suave (opcional pero muy recomendable) -->
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.34/dist/lenis.min.js"></script>
```

---

## DATOS CLAVE A USAR (ya extraídos del CSV)

```js
// Oros USA vs URSS/RUS en Juegos donde ambos participaron
const coldWarData = [
  { year: 1952, city: "Helsinki",    usa: 22, ussr: 22 },
  { year: 1956, city: "Melbourne",   usa: 17, ussr: 22 },
  { year: 1960, city: "Roma",        usa: 18, ussr: 25 },
  { year: 1964, city: "Tokyo",       usa: 18, ussr: 20 },
  { year: 1968, city: "México",      usa: 23, ussr: 17 },
  { year: 1972, city: "München",     usa: 18, ussr: 29 },
  { year: 1976, city: "Montréal",    usa: 18, ussr: 31 },
  { year: 1980, city: "Moskva",      usa:  6, ussr: 45 },  // BOICOT USA
  { year: 1984, city: "Los Angeles", usa: 44, ussr:  6 },  // BOICOT URSS
  { year: 1988, city: "Seoul",       usa: 19, ussr: 33 },
  // Post URSS — Rusia
  { year: 1996, city: "Atlanta",     usa: 44, rus: 26 },
  { year: 2000, city: "Sydney",      usa: 37, rus: 32 },
  { year: 2004, city: "Athina",      usa: 36, rus: 28 },
  { year: 2008, city: "Beijing",     usa: 36, rus: 24 },
  { year: 2012, city: "London",      usa: 48, rus: 18 },
  { year: 2016, city: "Rio",         usa: 46, rus: 19 },
  { year: 2020, city: "Tokyo",       usa: 39, rus: null }, // ROC, no Rusia oficial
];
```

---

## REFERENCIAS VISUALES DE ESTILO

- **Referencia general**: obys.agency — tipografía monumental, layouts asimétricos, scroll que revela contenido
- **Referencia de datos**: nytimes.com/interactive — narración con datos, tooltips precisos
- **Referencia de color**: La Forma del Agua poster — negro/dorado dramático con acentos de color controlados

---

## ESTRUCTURA DE ARCHIVOS SUGERIDA

```text
olympic-coldwar/
├── index.html
├── style.css
├── main.js          ← lógica de scroll y animaciones
├── chart.js         ← toda la lógica D3
└── data.js          ← los datos como constante JS exportable
```

---

## CHECKLIST DE CALIDAD ANTES DE PRESENTAR

- [ ] El cursor personalizado funciona y no se superpone mal con los textos
- [ ] Los gráficos D3 son responsive (usan viewBox o redimensionan con ResizeObserver)
- [ ] Los boicots del 80 y 84 tienen anotación visible sin necesidad de hover
- [ ] En móvil el layout se adapta (tipografía más pequeña, gráfico ocupa 100vw)
- [ ] Los tooltips tienen z-index correcto y no se cortan en los bordes
- [ ] Los colores de los aros solo aparecen en detalles pequeños, no dominan
- [ ] El dorado se usa máximo en 3 elementos por pantalla simultáneamente
