import * as d3 from "d3";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { chartPanelContent, coldWarMedalData, narrativeText, type ColdWarMedalDatum, type SideChoice } from "./data";

gsap.registerPlugin(ScrollTrigger);

type PointSeriesKey = "player" | "enemy";

type ChartPoint = ColdWarMedalDatum & {
  playerGold: number | null;
  enemyGold: number | null;
};

type InteractivePointDatum = ChartPoint & {
  golds: number;
  isBoycott: boolean;
  series: PointSeriesKey;
  baseRadius: number;
};

type ChartRenderOptions = {
  animateEntry?: boolean;
  revealStage?: boolean;
};

type HighlightRange = {
  startYear: number;
  endYear: number;
  dimOutside?: boolean;
  showFocus?: boolean;
  specialYear?: number;
};

type ChartHighlightController = {
  highlight: (blockIndex: number) => void;
  reset: () => void;
  destroy: () => void;
};

const CHART_MARGIN = { top: 44, right: 72, bottom: 68, left: 64 };
const CHART_WIDTH = 1280;
const CHART_HEIGHT = 780;
const CHART_ENTRY_DURATION = 2.5;
const CHART_ENTRY_DELAY = 0.3;
const CHART_AREA_OPACITY = 0.06;
const SIDE_STORAGE_KEY = "coldwar_side";

const BOYCOTT_ANNOTATIONS = {
  1980: { dx: -148, dy: -70, text: "USA BOYCOTT - 6 GOLDS" },
  1984: { dx: 44, dy: -82, text: "USSR BOYCOTT - 6 GOLDS" },
} as const;

const BLOCK_HIGHLIGHT_RANGES: HighlightRange[] = [
  { startYear: 1952, endYear: 1952, dimOutside: false, showFocus: false },
  { startYear: 1960, endYear: 1976, dimOutside: true, showFocus: true },
  { startYear: 1980, endYear: 1980, dimOutside: true, showFocus: true, specialYear: 1980 },
  { startYear: 1984, endYear: 1984, dimOutside: true, showFocus: true },
  { startYear: 1996, endYear: 2020, dimOutside: false, showFocus: true },
];

let activeSideChoice: SideChoice | null = null;
let chartResizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;
let chartEntryTimeline: gsap.core.Timeline | null = null;
let chartHoverCleanup: (() => void) | null = null;
let sidePickerCleanupFns: Array<() => void> = [];
let narrativeScrollTriggers: ScrollTrigger[] = [];
let activeNarrativeIndex = -1;
let chartHighlightController: ChartHighlightController | null = null;

function normalizeLabel(value: string): string {
  return value.replace(/"/g, "").trim();
}

function setSideTheme(side: SideChoice): void {
  const root = document.getElementById("cold-war-root") ?? document.documentElement;
  const shell = document.querySelector<HTMLElement>(".cw-page-shell");

  if (side === "usa") {
    root.style.setProperty("--player-color", "#1B4FAA");
    root.style.setProperty("--enemy-color", "#CC0000");
    root.style.setProperty("--player-label", '"USA"');
    root.style.setProperty("--enemy-label", '"USSR"');
    root.style.setProperty("--victory-word", '"VICTORY"');
    root.style.setProperty("--defeat-word", '"DEFEAT"');
    root.style.setProperty("--player-flag-accent", "#1B4FAA");
    shell?.style.setProperty("--cw-shell-band-color", "rgba(27, 79, 170, 0.34)");
    shell?.style.setProperty("--cw-shell-side-tint", "rgba(27, 79, 170, 0.3)");
    shell?.style.setProperty("--cw-shell-page-wash", "rgba(27, 79, 170, 0.18)");
    return;
  }

  root.style.setProperty("--player-color", "#CC0000");
  root.style.setProperty("--enemy-color", "#1B4FAA");
  root.style.setProperty("--player-label", '"USSR"');
  root.style.setProperty("--enemy-label", '"USA"');
  root.style.setProperty("--victory-word", '"VICTORY"');
  root.style.setProperty("--defeat-word", '"DEFEAT"');
  root.style.setProperty("--player-flag-accent", "#CC0000");
  shell?.style.setProperty("--cw-shell-band-color", "rgba(204, 0, 0, 0.34)");
  shell?.style.setProperty("--cw-shell-side-tint", "rgba(204, 0, 0, 0.28)");
  shell?.style.setProperty("--cw-shell-page-wash", "rgba(204, 0, 0, 0.16)");
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

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function hasGolds(
  datum: ChartPoint & {
    golds: number | null;
    isBoycott: boolean;
    series: PointSeriesKey;
    baseRadius: number;
  }
): datum is InteractivePointDatum {
  return datum.golds !== null;
}

function formatGoldValue(value: number | null): string {
  return value === null ? "N/A" : String(value);
}

function persistSideChoice(side: SideChoice): void {
  try {
    window.localStorage.setItem(SIDE_STORAGE_KEY, side);
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
}

function cleanupSidePickerListeners(): void {
  sidePickerCleanupFns.forEach((cleanup) => cleanup());
  sidePickerCleanupFns = [];
}

function cleanupChartHover(): void {
  chartHoverCleanup?.();
  chartHoverCleanup = null;
}

function cleanupChartHighlight(): void {
  chartHighlightController?.destroy();
  chartHighlightController = null;
}

function cleanupNarrativeScroll(): void {
  narrativeScrollTriggers.forEach((trigger) => trigger.kill());
  narrativeScrollTriggers = [];
  activeNarrativeIndex = -1;
}

function buildBlockHighlightRange(index: number): HighlightRange | null {
  return BLOCK_HIGHLIGHT_RANGES[index] ?? null;
}

function getHighlightBounds(range: HighlightRange, x: d3.ScaleLinear<number, number>): { left: number; right: number } {
  const years = coldWarMedalData.map((datum) => datum.year);
  const startIndex = years.indexOf(range.startYear);
  const endIndex = years.indexOf(range.endYear);
  const [chartLeft, chartRight] = x.range();

  if (startIndex === -1 || endIndex === -1) {
    return { left: chartLeft, right: chartRight };
  }

  const previousYear = years[startIndex - 1] ?? range.startYear;
  const nextYear = years[endIndex + 1] ?? range.endYear;
  const left = startIndex === 0 ? chartLeft : x((previousYear + range.startYear) / 2);
  const right = endIndex === years.length - 1 ? chartRight : x((range.endYear + nextYear) / 2);

  return { left, right };
}

function createChartHighlightController(
  chart: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: d3.ScaleLinear<number, number>,
  innerHeight: number
): ChartHighlightController {
  const overlayGroup = chart.append("g").attr("class", "cw-chart__overlay-group").attr("aria-hidden", "true");

  const focusOverlay = overlayGroup
    .append("rect")
    .attr("class", "cw-chart__overlay cw-chart__overlay--focus")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", innerHeight)
    .attr("rx", 18)
    .attr("ry", 18)
    .attr("opacity", 0);

  const leftOverlay = overlayGroup
    .append("rect")
    .attr("class", "cw-chart__overlay cw-chart__overlay--left")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", innerHeight)
    .attr("fill", "#0a0a0a")
    .attr("opacity", 0);

  const rightOverlay = overlayGroup
    .append("rect")
    .attr("class", "cw-chart__overlay cw-chart__overlay--right")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", innerHeight)
    .attr("fill", "#0a0a0a")
    .attr("opacity", 0);

  const haloNodes = chart.selectAll<SVGCircleElement, InteractivePointDatum>(".cw-chart__halo");
  const moscowHalo = haloNodes.filter((datum) => datum.year === 1980);

  function setMoscowPulse(isActive: boolean): void {
    moscowHalo.classed("is-highlighted", isActive);
  }

  function resetChartHighlight(): void {
    gsap.to([leftOverlay.node(), rightOverlay.node(), focusOverlay.node()].filter(isDefined), {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: true,
    });
    setMoscowPulse(false);
  }

  function highlightChartSection(range: HighlightRange): void {
    if (!range.showFocus && !range.dimOutside) {
      resetChartHighlight();
      return;
    }

    const { left, right } = getHighlightBounds(range, x);
    const [chartLeft, chartRight] = x.range();
    const leftWidth = Math.max(0, left - chartLeft);
    const rightX = Math.min(right, chartRight);
    const rightWidth = Math.max(0, chartRight - rightX);
    const dimOutside = range.dimOutside ?? true;
    const showFocus = range.showFocus ?? true;

    gsap.to(leftOverlay.node(), {
      attr: { x: chartLeft, width: leftWidth },
      opacity: dimOutside && leftWidth > 0 ? 0.6 : 0,
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: true,
    });

    gsap.to(rightOverlay.node(), {
      attr: { x: rightX, width: rightWidth },
      opacity: dimOutside && rightWidth > 0 ? 0.6 : 0,
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: true,
    });

    gsap.to(focusOverlay.node(), {
      attr: { x: left, width: Math.max(0, right - left) },
      opacity: showFocus ? 1 : 0,
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: true,
    });

    setMoscowPulse(range.specialYear === 1980);
  }

  return {
    highlight: (blockIndex: number) => {
      const range = buildBlockHighlightRange(blockIndex);
      if (!range) return;
      highlightChartSection(range);
    },
    reset: resetChartHighlight,
    destroy: () => {
      gsap.killTweensOf([leftOverlay.node(), rightOverlay.node(), focusOverlay.node()].filter(isDefined));
      setMoscowPulse(false);
      overlayGroup.remove();
    },
  };
}

function dispatchChartHighlight(blockIndex: number): void {
  chartHighlightController?.highlight(blockIndex);
}

function dispatchChartHighlightReset(): void {
  chartHighlightController?.reset();
}

function disconnectChartResizeObserver(): void {
  chartResizeObserver?.disconnect();
  chartResizeObserver = null;

  if (resizeFrame !== 0) {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
  }
}

function resetLineDraw(path: SVGPathElement | null): SVGPathElement | null {
  if (!path) return null;

  path.style.removeProperty("stroke-dasharray");
  path.style.removeProperty("stroke-dashoffset");

  return path;
}

function prepareLineDraw(path: SVGPathElement | null): SVGPathElement | null {
  if (!path) return null;

  const totalLength = path.getTotalLength();
  path.style.strokeDasharray = `${totalLength}`;
  path.style.strokeDashoffset = `${totalLength}`;

  return path;
}

function animateChartEntry(lines: SVGPathElement[], areas: SVGPathElement[]): void {
  chartEntryTimeline?.kill();
  gsap.set(areas, { opacity: 0 });

  const timeline = gsap.timeline({ delay: CHART_ENTRY_DELAY });
  chartEntryTimeline = timeline;

  timeline.to(
    lines,
    {
      strokeDashoffset: 0,
      duration: CHART_ENTRY_DURATION,
      ease: "power2.inOut",
    },
    0
  );

  timeline.to(
    areas,
    {
      opacity: CHART_AREA_OPACITY,
      duration: CHART_ENTRY_DURATION,
      ease: "power2.inOut",
    },
    0
  );

  timeline.eventCallback("onComplete", () => {
    chartEntryTimeline = null;
  });
}

function setupChartResize(chartRoot: HTMLElement): void {
  disconnectChartResizeObserver();

  if (typeof ResizeObserver === "undefined") return;

  let lastWidth = Math.round(chartRoot.getBoundingClientRect().width);
  let lastHeight = Math.round(chartRoot.getBoundingClientRect().height);

  chartResizeObserver = new ResizeObserver((entries) => {
    if (!activeSideChoice) return;

    const entry = entries[0];
    if (!entry) return;

    const nextWidth = Math.round(entry.contentRect.width);
    const nextHeight = Math.round(entry.contentRect.height);

    if (nextWidth === lastWidth && nextHeight === lastHeight) return;

    lastWidth = nextWidth;
    lastHeight = nextHeight;

    if (resizeFrame !== 0) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      const currentSideChoice = activeSideChoice;
      resizeFrame = 0;
      if (!currentSideChoice) return;
      initChart(currentSideChoice, { animateEntry: false, revealStage: false });
    });
  });

  chartResizeObserver.observe(chartRoot);
}

function addManagedListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  eventName: K,
  listener: (event: HTMLElementEventMap[K]) => void
): void {
  target.addEventListener(eventName, listener as EventListener);
  sidePickerCleanupFns.push(() => target.removeEventListener(eventName, listener as EventListener));
}

function buildNarrativeBlocksMarkup(side: SideChoice): string {
  return narrativeText[side]
    .map(
      (block, index) => `
        <article class="cw-narrative-block${index === 0 ? " is-active" : ""}" id="${block.id}" data-block-index="${index}" data-scroll-state="${
          index === 0 ? "active" : "upcoming"
        }" aria-labelledby="${block.id}-title">
          <div class="cw-narrative-block__inner">
            <h2 class="cw-narrative-block__title" id="${block.id}-title">${block.title}</h2>
            <div class="cw-narrative-block__body">
              ${block.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderNarrative(side: SideChoice): void {
  const narrativeTrack = document.getElementById("cw-narrative-track");
  if (!narrativeTrack) return;

  narrativeTrack.innerHTML = buildNarrativeBlocksMarkup(side);
}

function setActiveNarrativeBlock(blocks: HTMLElement[], nextIndex: number): void {
  if (activeNarrativeIndex === nextIndex) return;

  activeNarrativeIndex = nextIndex;

  blocks.forEach((block, index) => {
    block.classList.toggle("is-active", index === nextIndex);

    if (index < nextIndex) {
      block.dataset.scrollState = "past";
      return;
    }

    if (index > nextIndex) {
      block.dataset.scrollState = "upcoming";
      return;
    }

    block.dataset.scrollState = "active";
  });

  const activeBlock = blocks[nextIndex];
  if (!activeBlock) return;

  const animatedNodes = activeBlock.querySelectorAll(".cw-narrative-block__title, .cw-narrative-block__body p");

  gsap.fromTo(
    animatedNodes,
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.05,
      ease: "power3.out",
      overwrite: true,
    }
  );
}

function initNarrativeScroll(): void {
  cleanupNarrativeScroll();

  const scrolly = document.querySelector<HTMLElement>(".cw-scrolly");
  const chartPanel = document.querySelector<HTMLElement>(".cw-chart-panel");
  const chartPanelInner = chartPanel?.querySelector<HTMLElement>(".cw-chart-panel__inner") ?? null;
  const blocks = gsap.utils.toArray<HTMLElement>(".cw-narrative-block");
  if (blocks.length === 0 || !scrolly || !chartPanel || !chartPanelInner) return;

  setActiveNarrativeBlock(blocks, 0);
  dispatchChartHighlight(0);

  if (window.innerWidth > 768) {
    narrativeScrollTriggers.push(
      ScrollTrigger.create({
        trigger: scrolly,
        start: "top top+=60",
        end: "bottom bottom",
        pin: chartPanelInner,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })
    );
  }

  narrativeScrollTriggers.push(
    ...blocks.map((block, index) =>
      ScrollTrigger.create({
        trigger: block,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          setActiveNarrativeBlock(blocks, index);
          dispatchChartHighlight(index);
        },
        onEnterBack: () => {
          setActiveNarrativeBlock(blocks, index);
          dispatchChartHighlight(index);
        },
        onLeave: () => {
          if (index < blocks.length - 1) {
            block.dataset.scrollState = "past";
          } else {
            dispatchChartHighlightReset();
          }
        },
        onLeaveBack: () => {
          if (index > 0) {
            block.dataset.scrollState = "upcoming";
          } else {
            dispatchChartHighlightReset();
          }
        },
      })
    )
  );

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function initHover(chartRoot: HTMLElement, playerLabel: string, enemyLabel: string): () => void {
  const tooltip = document.createElement("div");
  tooltip.className = "cw-chart-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.setAttribute("aria-hidden", "true");
  chartRoot.appendChild(tooltip);

  const points = d3.select(chartRoot).selectAll<SVGCircleElement, InteractivePointDatum>(".cw-chart__point");

  function positionTooltip(event: MouseEvent): void {
    const bounds = chartRoot.getBoundingClientRect();
    const tooltipBounds = tooltip.getBoundingClientRect();
    const padding = 12;
    const offset = 16;

    let left = event.clientX - bounds.left + offset;
    let top = event.clientY - bounds.top - tooltipBounds.height - offset;

    if (left + tooltipBounds.width > bounds.width - padding) {
      left = event.clientX - bounds.left - tooltipBounds.width - offset;
    }

    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = event.clientY - bounds.top + offset;
    }

    if (top + tooltipBounds.height > bounds.height - padding) {
      top = bounds.height - tooltipBounds.height - padding;
    }

    if (top < padding) {
      top = padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(event: MouseEvent, datum: InteractivePointDatum): void {
    tooltip.innerHTML = `
      <p class="cw-chart-tooltip__title">${datum.city} ${datum.year}</p>
      <div class="cw-chart-tooltip__row">
        <span>${playerLabel}</span>
        <strong>${formatGoldValue(datum.playerGold)}</strong>
      </div>
      <div class="cw-chart-tooltip__row">
        <span>${enemyLabel}</span>
        <strong>${formatGoldValue(datum.enemyGold)}</strong>
      </div>
    `;

    tooltip.dataset.visible = "true";
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(event);

    gsap.killTweensOf(tooltip);
    gsap.to(tooltip, {
      autoAlpha: 1,
      y: 0,
      duration: 0.18,
      ease: "power2.out",
      overwrite: true,
    });
  }

  function hideTooltip(): void {
    delete tooltip.dataset.visible;
    tooltip.setAttribute("aria-hidden", "true");

    gsap.killTweensOf(tooltip);
    gsap.to(tooltip, {
      autoAlpha: 0,
      y: 6,
      duration: 0.14,
      ease: "power2.out",
      overwrite: true,
    });
  }

  points
    .style("cursor", "pointer")
    .on("mouseover", function (event, datum) {
      gsap.killTweensOf(this);
      gsap.to(this, {
        attr: { r: datum.baseRadius + 4 },
        duration: 0.18,
        ease: "power2.out",
        overwrite: true,
      });

      showTooltip(event as MouseEvent, datum);
    })
    .on("mousemove", function (event, datum) {
      if (tooltip.dataset.visible !== "true") return;
      positionTooltip(event as MouseEvent);

      const currentEvent = event as MouseEvent;
      const point = this as SVGCircleElement;
      point.setAttribute(
        "aria-label",
        `${datum.city} ${datum.year}: ${playerLabel} ${formatGoldValue(datum.playerGold)} golds, ${enemyLabel} ${formatGoldValue(datum.enemyGold)} golds`
      );
      if (currentEvent.buttons !== 0) {
        hideTooltip();
      }
    })
    .on("mouseout", function (_event, datum) {
      gsap.killTweensOf(this);
      gsap.to(this, {
        attr: { r: datum.baseRadius },
        duration: 0.16,
        ease: "power2.out",
        overwrite: true,
      });

      hideTooltip();
    });

  gsap.set(tooltip, { autoAlpha: 0, y: 6 });

  return () => {
    points.on("mouseover", null).on("mousemove", null).on("mouseout", null).style("cursor", null);
    gsap.killTweensOf(tooltip);
    gsap.killTweensOf(points.nodes());
    tooltip.remove();
  };
}

export function buildColdWarMarkup(): string {
  const initialPanelContent = chartPanelContent.usa;

  return `
    <div class="cw-layout">
      <section class="cw-scrolly" aria-labelledby="cw-chart-title">
        <div class="cw-narrative-track" id="cw-narrative-track">
          ${buildNarrativeBlocksMarkup("usa")}
        </div>

        <aside class="cw-chart-panel">
          <div class="cw-chart-panel__inner">
            <figure class="cw-chart-frame">
              <figcaption class="cw-chart-frame__meta" data-chart-copy="figure-meta">${initialPanelContent.figureMeta}</figcaption>
              <div class="cw-chart" id="cw-chart" role="img" aria-label="Line chart comparing Olympic gold medals for the selected Cold War rivalry"></div>
            </figure>

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

            <div class="cw-chart-copy">
              <h1 class="cw-stage__title" id="cw-chart-title" data-chart-copy="title">${initialPanelContent.title}</h1>
              <p class="cw-stage__copy" data-chart-copy="body">${initialPanelContent.copy}</p>
              <p class="cw-stage__meta" data-chart-copy="meta">${initialPanelContent.meta}</p>
            </div>
          </div>
        </aside>
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

export function initChart(side: SideChoice, options: ChartRenderOptions = {}): void {
  const chartRoot = document.getElementById("cw-chart");
  const storyRoot = document.getElementById("cold-war-root");
  const { animateEntry = true, revealStage = true } = options;

  if (!chartRoot || !storyRoot) return;

  activeSideChoice = side;
  cleanupChartHover();
  cleanupChartHighlight();

  chartRoot.innerHTML = "";

  const computedStyle = getComputedStyle(storyRoot);
  const playerLabel = normalizeLabel(computedStyle.getPropertyValue("--player-label")) || (side === "usa" ? "USA" : "USSR");
  const enemyLabel = normalizeLabel(computedStyle.getPropertyValue("--enemy-label")) || (side === "usa" ? "USSR" : "USA");
  const panelContent = chartPanelContent[side];

  const playerLegend = storyRoot.querySelector('[data-chart-label="player"]');
  const enemyLegend = storyRoot.querySelector('[data-chart-label="enemy"]');
  const panelTitle = storyRoot.querySelector('[data-chart-copy="title"]');
  const panelBody = storyRoot.querySelector('[data-chart-copy="body"]');
  const panelMeta = storyRoot.querySelector('[data-chart-copy="meta"]');
  const panelFigureMeta = storyRoot.querySelector('[data-chart-copy="figure-meta"]');

  if (playerLegend) playerLegend.textContent = playerLabel;
  if (enemyLegend) enemyLegend.textContent = enemyLabel;
  if (panelTitle) panelTitle.textContent = panelContent.title;
  if (panelBody) panelBody.textContent = panelContent.copy;
  if (panelMeta) panelMeta.textContent = panelContent.meta;
  if (panelFigureMeta) panelFigureMeta.textContent = panelContent.figureMeta;

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

  const enemyArea = chart.append("path").datum(data).attr("class", "cw-chart__area cw-chart__area--enemy").attr("d", areaEnemy);
  const playerArea = chart.append("path").datum(data).attr("class", "cw-chart__area cw-chart__area--player").attr("d", areaPlayer);
  const enemyLine = chart.append("path").datum(data).attr("class", "cw-chart__line cw-chart__line--enemy").attr("d", lineEnemy);
  const playerLine = chart.append("path").datum(data).attr("class", "cw-chart__line cw-chart__line--player").attr("d", linePlayer);

  const areaNodes = [enemyArea.node(), playerArea.node()].filter(isDefined);
  const lineNodes = [enemyLine.node(), playerLine.node()].filter(isDefined);

  if (animateEntry) {
    animateChartEntry([prepareLineDraw(enemyLine.node()), prepareLineDraw(playerLine.node())].filter(isDefined), areaNodes);
  } else {
    chartEntryTimeline?.kill();
    chartEntryTimeline = null;
    lineNodes.forEach((line) => resetLineDraw(line));
    gsap.set(areaNodes, { opacity: CHART_AREA_OPACITY });
  }

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
          series: series.key,
          isBoycott: isBoycottPoint(datum, side, series.key, golds),
          baseRadius: isBoycottPoint(datum, side, series.key, golds) ? 7 : 5,
        };
      })
      .filter(hasGolds);

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
          .attr("r", (datum) => datum.baseRadius)
          .attr(
            "aria-label",
            (datum) => `${datum.city} ${datum.year}: ${playerLabel} ${formatGoldValue(datum.playerGold)} golds, ${enemyLabel} ${formatGoldValue(datum.enemyGold)} golds`
          );

        return pointGroup;
      });
  });

  chartHighlightController = createChartHighlightController(chart, x, innerHeight);

  chartHoverCleanup = initHover(chartRoot, playerLabel, enemyLabel);

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

  setupChartResize(chartRoot);

  const stage = storyRoot.querySelector(".cw-chart-panel__inner");
  if (stage && revealStage) {
    gsap.fromTo(stage, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }
}

export function initSidePicker(): void {
  const root = document.getElementById("cold-war-root");
  const picker = document.querySelector(".cw-side-picker");
  if (!picker || !root) return;

  cleanupSidePickerListeners();

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

  addManagedListener(usaSide, "mouseenter", () => {
    usaSide.classList.add("cw-side--active");
    ussrSide.classList.add("cw-side--inactive");
  });

  addManagedListener(usaSide, "mouseleave", () => {
    usaSide.classList.remove("cw-side--active");
    ussrSide.classList.remove("cw-side--inactive");
  });

  addManagedListener(ussrSide, "mouseenter", () => {
    ussrSide.classList.add("cw-side--active");
    usaSide.classList.add("cw-side--inactive");
  });

  addManagedListener(ussrSide, "mouseleave", () => {
    ussrSide.classList.remove("cw-side--active");
    usaSide.classList.remove("cw-side--inactive");
  });

  const handleSideChoice = async (side: SideChoice) => {
    setSideTheme(side);
    persistSideChoice(side);
    await animatePickerOut(picker);

    picker.remove();
    root.classList.remove("cw-side-picker-container");
    root.dataset.sideChoice = side;
    document.body.style.overflow = "";
    renderNarrative(side);
    initChart(side);
    initNarrativeScroll();
  };

  if (usaButton) {
    addManagedListener(usaButton, "click", () => {
      void handleSideChoice("usa");
    });
  }

  if (ussrButton) {
    addManagedListener(ussrButton, "click", () => {
      void handleSideChoice("ussr");
    });
  }
}

export function destroyColdWar(): void {
  cleanupSidePickerListeners();
  cleanupChartHover();
  cleanupChartHighlight();
  cleanupNarrativeScroll();
  disconnectChartResizeObserver();
  chartEntryTimeline?.kill();
  chartEntryTimeline = null;
  activeSideChoice = null;
  document.body.style.overflow = "";
}
