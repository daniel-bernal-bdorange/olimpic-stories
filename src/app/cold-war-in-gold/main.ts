import * as d3 from "d3";
import gsap from "gsap";

import { coldWarMedalData, type ColdWarMedalDatum } from "./data";

type SideChoice = "usa" | "ussr";

type ChartPoint = ColdWarMedalDatum & {
  playerGold: number | null;
  enemyGold: number | null;
};

const CHART_MARGIN = { top: 40, right: 60, bottom: 50, left: 50 };
const CHART_WIDTH = 1100;
const CHART_HEIGHT = 620;

const BOYCOTT_ANNOTATIONS = {
  1980: { dx: -148, dy: -70, text: "USA BOYCOTT - 6 GOLDS" },
  1984: { dx: 44, dy: -82, text: "USSR BOYCOTT - 6 GOLDS" },
} as const;

function normalizeLabel(value: string): string {
  return value.replace(/"/g, "").trim();
}

function setSideTheme(side: SideChoice): void {
  const root = document.getElementById("cold-war-root") ?? document.documentElement;

  if (side === "usa") {
    root.style.setProperty("--player-color", "#1B4FAA");
    root.style.setProperty("--enemy-color", "#CC0000");
    root.style.setProperty("--player-label", '"USA"');
    root.style.setProperty("--enemy-label", '"USSR"');
    root.style.setProperty("--victory-word", '"VICTORY"');
    root.style.setProperty("--defeat-word", '"DEFEAT"');
    root.style.setProperty("--player-flag-accent", "#1B4FAA");
    return;
  }

  root.style.setProperty("--player-color", "#CC0000");
  root.style.setProperty("--enemy-color", "#1B4FAA");
  root.style.setProperty("--player-label", '"USSR"');
  root.style.setProperty("--enemy-label", '"USA"');
  root.style.setProperty("--victory-word", '"VICTORY"');
  root.style.setProperty("--defeat-word", '"DEFEAT"');
  root.style.setProperty("--player-flag-accent", "#CC0000");
}

function animatePickerOut(picker: Element): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(picker, {
      y: "-100vh",
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: resolve,
    });
  });
}

function getChartData(side: SideChoice): ChartPoint[] {
  return coldWarMedalData.map((datum) => ({
    ...datum,
    playerGold: side === "usa" ? datum.usaGold : datum.rivalGold,
    enemyGold: side === "usa" ? datum.rivalGold : datum.usaGold,
  }));
}

function isBoycottPoint(datum: ChartPoint, side: SideChoice, series: "player" | "enemy", golds: number | null): boolean {
  if (golds !== 6) return false;

  if (datum.year === 1980) {
    return (side === "usa" && series === "player") || (side === "ussr" && series === "enemy");
  }

  if (datum.year === 1984) {
    return (side === "usa" && series === "enemy") || (side === "ussr" && series === "player");
  }

  return false;
}

export function buildColdWarMarkup(): string {
  return `
    <div class="cw-layout">
      <section class="cw-hero" aria-labelledby="cw-story-title">
        <p class="cw-kicker">01 / 1952-2020</p>
        <h1 class="cw-title" id="cw-story-title">Cold War in Gold</h1>
        <p class="cw-subtitle">
          Two superpowers turned the Olympic medal table into a geopolitical scoreboard.
          The rivalry peaks in the boycott years and keeps echoing into the post-Soviet era.
        </p>
      </section>

      <section class="cw-stage" aria-labelledby="cw-chart-title">
        <div class="cw-chart-shell">
          <div class="cw-chart-copy">
            <p class="cw-kicker">Static chart / CWG-04</p>
            <h2 class="cw-stage__title" id="cw-chart-title">The scoreboard that changed history</h2>
            <p class="cw-stage__copy">
              A responsive D3 chart tracks Olympic gold medals from Helsinki 1952 to Tokyo 2020,
              with the 1980 and 1984 boycotts pinned as visible narrative shocks.
            </p>
            <p class="cw-stage__meta">17 editions · curveMonotoneX · visible boycott annotations</p>

            <div class="cw-chart-legend" aria-label="Chart legend">
              <div class="cw-chart-legend__item">
                <span class="cw-chart-legend__swatch cw-chart-legend__swatch--player"></span>
                <span class="cw-chart-legend__label" data-chart-label="player">USA</span>
              </div>
              <div class="cw-chart-legend__item">
                <span class="cw-chart-legend__swatch cw-chart-legend__swatch--enemy"></span>
                <span class="cw-chart-legend__label" data-chart-label="enemy">USSR</span>
              </div>
            </div>
          </div>

          <figure class="cw-chart-frame">
            <figcaption class="cw-chart-frame__meta">Olympic gold medals per Summer Games edition</figcaption>
            <div class="cw-chart" id="cw-chart" role="img" aria-label="Line chart comparing Olympic gold medals for the selected Cold War rivalry"></div>
          </figure>
        </div>
      </section>
    </div>

    <div class="cw-side-picker" role="presentation">
      <div class="cw-side cw-side--usa" aria-labelledby="side-usa-label">
        <div class="cw-side__backdrop"></div>
        <div class="cw-side__overlay"></div>
        <div class="cw-side__content">
          <p class="cw-side__position" id="side-usa-position">01</p>
          <p class="cw-side__period" id="side-usa-period">1952-1988</p>
          <p class="cw-side__prompt">PLAY AS</p>
          <h1 class="cw-side__label" id="side-usa-label">USA</h1>
          <p class="cw-side__medals" id="side-usa-medals">44 GOLDS</p>
          <button class="cw-side__button" data-side="usa" aria-label="Choose USA side">CHOOSE THIS SIDE</button>
        </div>
      </div>

      <div class="cw-side cw-side--ussr" aria-labelledby="side-ussr-label">
        <div class="cw-side__backdrop"></div>
        <div class="cw-side__overlay"></div>
        <div class="cw-side__content">
          <p class="cw-side__position" id="side-ussr-position">02</p>
          <p class="cw-side__period" id="side-ussr-period">1952-1988</p>
          <p class="cw-side__prompt">PLAY AS</p>
          <h1 class="cw-side__label" id="side-ussr-label">USSR</h1>
          <p class="cw-side__medals" id="side-ussr-medals">395 GOLDS</p>
          <button class="cw-side__button" data-side="ussr" aria-label="Choose USSR side">CHOOSE THIS SIDE</button>
        </div>
      </div>
    </div>
  `;
}

export function initChart(side: SideChoice): void {
  const chartRoot = document.getElementById("cw-chart");
  const storyRoot = document.getElementById("cold-war-root");

  if (!chartRoot || !storyRoot) return;

  chartRoot.innerHTML = "";

  const computedStyle = getComputedStyle(storyRoot);
  const playerLabel = normalizeLabel(computedStyle.getPropertyValue("--player-label")) || (side === "usa" ? "USA" : "USSR");
  const enemyLabel = normalizeLabel(computedStyle.getPropertyValue("--enemy-label")) || (side === "usa" ? "USSR" : "USA");

  const playerLegend = storyRoot.querySelector('[data-chart-label="player"]');
  const enemyLegend = storyRoot.querySelector('[data-chart-label="enemy"]');

  if (playerLegend) playerLegend.textContent = playerLabel;
  if (enemyLegend) enemyLegend.textContent = enemyLabel;

  const innerWidth = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;
  const data = getChartData(side);

  const x = d3.scaleLinear().domain([1952, 2020]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, 60]).range([innerHeight, 0]);

  const svg = d3
    .select(chartRoot)
    .append("svg")
    .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
    .attr("aria-hidden", "true");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

  chart
    .append("g")
    .attr("class", "cw-chart__grid")
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerWidth).tickFormat(() => ""))
    .call((grid) => grid.select(".domain").remove());

  const areaPlayer = d3
    .area<ChartPoint>()
    .defined((datum) => datum.playerGold !== null)
    .x((datum) => x(datum.year))
    .y0(y(0))
    .y1((datum) => y(datum.playerGold ?? 0))
    .curve(d3.curveMonotoneX);

  const areaEnemy = d3
    .area<ChartPoint>()
    .defined((datum) => datum.enemyGold !== null)
    .x((datum) => x(datum.year))
    .y0(y(0))
    .y1((datum) => y(datum.enemyGold ?? 0))
    .curve(d3.curveMonotoneX);

  const linePlayer = d3
    .line<ChartPoint>()
    .defined((datum) => datum.playerGold !== null)
    .x((datum) => x(datum.year))
    .y((datum) => y(datum.playerGold ?? 0))
    .curve(d3.curveMonotoneX);

  const lineEnemy = d3
    .line<ChartPoint>()
    .defined((datum) => datum.enemyGold !== null)
    .x((datum) => x(datum.year))
    .y((datum) => y(datum.enemyGold ?? 0))
    .curve(d3.curveMonotoneX);

  chart.append("path").datum(data).attr("class", "cw-chart__area cw-chart__area--enemy").attr("d", areaEnemy);
  chart.append("path").datum(data).attr("class", "cw-chart__area cw-chart__area--player").attr("d", areaPlayer);
  chart.append("path").datum(data).attr("class", "cw-chart__line cw-chart__line--enemy").attr("d", lineEnemy);
  chart.append("path").datum(data).attr("class", "cw-chart__line cw-chart__line--player").attr("d", linePlayer);

  const pointSeries = [
    {
      key: "enemy" as const,
      className: "cw-chart__point cw-chart__point--enemy",
      value: (datum: ChartPoint) => datum.enemyGold,
    },
    {
      key: "player" as const,
      className: "cw-chart__point cw-chart__point--player",
      value: (datum: ChartPoint) => datum.playerGold,
    },
  ];

  pointSeries.forEach((series) => {
    const group = chart.append("g").attr("class", `cw-chart__points cw-chart__points--${series.key}`);
    const points = data
      .map((datum) => {
        const golds = series.value(datum);
        return {
          ...datum,
          golds,
          isBoycott: isBoycottPoint(datum, side, series.key, golds),
        };
      })
      .filter((datum) => datum.golds !== null);

    group
      .selectAll("g")
      .data(points)
      .join((enter) => {
        const pointGroup = enter.append("g");

        pointGroup
          .filter((datum) => datum.isBoycott)
          .append("circle")
          .attr("class", "cw-chart__halo")
          .attr("cx", (datum) => x(datum.year))
          .attr("cy", (datum) => y(datum.golds ?? 0))
          .attr("r", 7)
          .style("transform-origin", (datum) => `${x(datum.year)}px ${y(datum.golds ?? 0)}px`);

        pointGroup
          .append("circle")
          .attr("class", (datum) => `${series.className}${datum.isBoycott ? " is-boycott" : ""}`)
          .attr("cx", (datum) => x(datum.year))
          .attr("cy", (datum) => y(datum.golds ?? 0))
          .attr("r", (datum) => (datum.isBoycott ? 7 : 5))
          .attr("aria-label", (datum) => `${datum.city} ${datum.year}: ${datum.golds} gold medals`)
          .append("title")
          .text((datum) => `${datum.city} ${datum.year}: ${datum.golds} golds`);

        return pointGroup;
      });
  });

  const annotationGroup = chart.append("g").attr("class", "cw-chart__annotations");

  data
    .filter((datum) => datum.boycott !== null)
    .forEach((datum) => {
      const annotation = BOYCOTT_ANNOTATIONS[datum.year as keyof typeof BOYCOTT_ANNOTATIONS];
      const boycottValue = datum.boycott === "usa" ? datum.usaGold : datum.rivalGold;
      if (!annotation || boycottValue === null) return;

      const pointX = x(datum.year);
      const pointY = y(boycottValue);
      const labelX = pointX + annotation.dx;
      const labelY = pointY + annotation.dy;

      annotationGroup
        .append("line")
        .attr("class", "cw-chart__annotation-line")
        .attr("x1", pointX)
        .attr("y1", pointY)
        .attr("x2", labelX)
        .attr("y2", labelY + 14);

      annotationGroup
        .append("text")
        .attr("class", "cw-chart__annotation-text")
        .attr("x", labelX)
        .attr("y", labelY)
        .text(annotation.text);
    });

  chart
    .append("g")
    .attr("class", "cw-chart__axis cw-chart__axis--x")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickValues(coldWarMedalData.map((datum) => datum.year)).tickFormat(d3.format("d")));

  chart.append("g").attr("class", "cw-chart__axis cw-chart__axis--y").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("d")));

  chart
    .append("text")
    .attr("class", "cw-chart__axis-label")
    .attr("x", innerWidth)
    .attr("y", innerHeight + 42)
    .attr("text-anchor", "end")
    .text("SUMMER GAMES EDITION");

  chart
    .append("text")
    .attr("class", "cw-chart__axis-label")
    .attr("x", 0)
    .attr("y", -18)
    .text("GOLD MEDALS");

  const stage = storyRoot.querySelector(".cw-stage");
  if (stage) {
    gsap.fromTo(stage, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }
}

export function initSidePicker(): void {
  const root = document.getElementById("cold-war-root");
  const picker = document.querySelector(".cw-side-picker");
  if (!picker || !root) return;

  const usaSide = picker.querySelector(".cw-side--usa") as HTMLElement;
  const ussrSide = picker.querySelector(".cw-side--ussr") as HTMLElement;
  const usaButton = usaSide?.querySelector(".cw-side__button") as HTMLButtonElement;
  const ussrButton = ussrSide?.querySelector(".cw-side__button") as HTMLButtonElement;

  if (!usaSide || !ussrSide) return;

  gsap.fromTo(
    [usaSide, ussrSide],
    { x: (index) => (index === 0 ? "-100%" : "100%") },
    {
      x: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
    }
  );

  usaSide.addEventListener("mouseenter", () => {
    usaSide.classList.add("cw-side--active");
    ussrSide.classList.add("cw-side--inactive");
  });

  usaSide.addEventListener("mouseleave", () => {
    usaSide.classList.remove("cw-side--active");
    ussrSide.classList.remove("cw-side--inactive");
  });

  ussrSide.addEventListener("mouseenter", () => {
    ussrSide.classList.add("cw-side--active");
    usaSide.classList.add("cw-side--inactive");
  });

  ussrSide.addEventListener("mouseleave", () => {
    ussrSide.classList.remove("cw-side--active");
    usaSide.classList.remove("cw-side--inactive");
  });

  const handleSideChoice = async (side: SideChoice) => {
    setSideTheme(side);
    await animatePickerOut(picker);

    picker.remove();
    root.classList.remove("cw-side-picker-container");
    document.body.style.overflow = "";
    initChart(side);
  };

  usaButton?.addEventListener("click", () => handleSideChoice("usa"));
  ussrButton?.addEventListener("click", () => handleSideChoice("ussr"));
}
