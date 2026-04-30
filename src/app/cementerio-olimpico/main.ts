import * as d3 from "d3";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_CONTENT_SELECTOR = "[data-ls-timeline-content]";
const TIMELINE_STAGE_SELECTOR = "[data-ls-timeline-stage]";
const TIMELINE_CARD_SELECTOR = "[data-ls-timeline-card]";
const REVEAL_CARD_SELECTOR = "[data-ls-card-reveal]";
const TIMELINE_YEAR_ATTRIBUTE = "data-ls-year";
const TIMELINE_EDGE_PADDING = 26;
const TIMELINE_MARKER_X = 46;
const TIMELINE_LABEL_X = 2;
const TIMELINE_LINE_COLOR = "#3a3a3a";
const TIMELINE_MUTED_COLOR = "#b8b0a4";
const TIMELINE_GOLD_COLOR = "#c9a84c";
const TIMELINE_INACTIVE_DOT = 4;
const TIMELINE_ACTIVE_DOT = 5.6;
const TIMELINE_BASE_HALO = 9;
const TIMELINE_ACTIVE_HALO = 12.5;
const TIMELINE_MIN_MARKER_GAP = 28;
const TIMELINE_ENTRY_DURATION = 1.35;
const CARD_REVEAL_DISTANCE = 72;

type CardSide = "left" | "right";

type TimelineMarkerNode = {
  year: number;
  y: number;
  connector: SVGLineElement;
  dot: SVGCircleElement;
  halo: SVGCircleElement;
  label: SVGTextElement;
};

let teardownLostSports: (() => void) | null = null;
let activeRoot: HTMLElement | null = null;
let timelineResizeObserver: ResizeObserver | null = null;
let timelineMutationObserver: MutationObserver | null = null;
let timelineRenderFrame = 0;
let timelineUpdateFrame = 0;
let pendingTimelineAnimation = false;
let timelineMarkers: TimelineMarkerNode[] = [];
let activeTimelineYear: number | null = null;
let activeTimelineStage: HTMLElement | null = null;
let activeTimelineLine: SVGPathElement | null = null;
let cardRevealTriggers: ScrollTrigger[] = [];

function getRevealCards(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(REVEAL_CARD_SELECTOR)).filter((card) => card.isConnected);
}

function getCardSide(card: HTMLElement): CardSide {
  return card.dataset.lsCardSide === "right" ? "right" : "left";
}

function cleanupCardReveals() {
  cardRevealTriggers.forEach((trigger) => trigger.kill());
  cardRevealTriggers = [];
}

function setupCardReveals(root: HTMLElement) {
  cleanupCardReveals();

  const cards = getRevealCards(root);

  for (const card of cards) {
    const side = getCardSide(card);

    gsap.set(card, {
      autoAlpha: 0,
      x: side === "right" ? CARD_REVEAL_DISTANCE : -CARD_REVEAL_DISTANCE,
    });

    const tween = gsap.to(card, {
      autoAlpha: 1,
      x: 0,
      duration: 0.82,
      ease: "power3.out",
      overwrite: true,
      scrollTrigger: {
        trigger: card,
        start: "top 82%",
        once: true,
      },
    });

    if (tween.scrollTrigger) {
      cardRevealTriggers.push(tween.scrollTrigger);
    }
  }

  ScrollTrigger.refresh();
}

function resetLineDraw(path: SVGPathElement | null): SVGPathElement | null {
  if (!path) {
    return null;
  }

  path.style.removeProperty("stroke-dasharray");
  path.style.removeProperty("stroke-dashoffset");

  return path;
}

function prepareLineDraw(path: SVGPathElement | null): SVGPathElement | null {
  if (!path) {
    return null;
  }

  const totalLength = path.getTotalLength();
  path.style.strokeDasharray = `${totalLength}`;
  path.style.strokeDashoffset = `${totalLength}`;

  return path;
}

function disconnectTimelineObservers() {
  timelineResizeObserver?.disconnect();
  timelineResizeObserver = null;
  timelineMutationObserver?.disconnect();
  timelineMutationObserver = null;

  if (timelineRenderFrame !== 0) {
    window.cancelAnimationFrame(timelineRenderFrame);
    timelineRenderFrame = 0;
  }

  if (timelineUpdateFrame !== 0) {
    window.cancelAnimationFrame(timelineUpdateFrame);
    timelineUpdateFrame = 0;
  }
}

function getTimelineCards(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TIMELINE_CARD_SELECTOR)).filter((card) => card.isConnected);
}

function normaliseMarkerPositions(entries: Array<{ year: number; y: number }>, height: number) {
  if (entries.length <= 1) {
    return entries;
  }

  const minY = TIMELINE_EDGE_PADDING;
  const maxY = Math.max(height - TIMELINE_EDGE_PADDING, minY);
  const adjusted = entries.map((entry) => ({ ...entry }));

  adjusted[0].y = Math.max(adjusted[0].y, minY);

  for (let index = 1; index < adjusted.length; index += 1) {
    adjusted[index].y = Math.max(adjusted[index].y, adjusted[index - 1].y + TIMELINE_MIN_MARKER_GAP);
  }

  adjusted[adjusted.length - 1].y = Math.min(adjusted[adjusted.length - 1].y, maxY);

  for (let index = adjusted.length - 2; index >= 0; index -= 1) {
    adjusted[index].y = Math.min(adjusted[index].y, adjusted[index + 1].y - TIMELINE_MIN_MARKER_GAP);
  }

  return adjusted.map((entry) => ({
    ...entry,
    y: Math.min(Math.max(entry.y, minY), maxY),
  }));
}

function updateTimelineActiveMarker() {
  const stage = activeTimelineStage;

  if (!stage || timelineMarkers.length === 0) {
    activeTimelineYear = null;
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;

  let nextActiveMarker = timelineMarkers[0];
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const marker of timelineMarkers) {
    const distance = Math.abs(stageRect.top + marker.y - viewportCenter);

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nextActiveMarker = marker;
    }
  }

  if (activeTimelineYear === nextActiveMarker.year) {
    return;
  }

  activeTimelineYear = nextActiveMarker.year;

  for (const marker of timelineMarkers) {
    const isActive = marker.year === nextActiveMarker.year;

    gsap.to(marker.dot, {
      attr: { r: isActive ? TIMELINE_ACTIVE_DOT : TIMELINE_INACTIVE_DOT },
      fill: isActive ? TIMELINE_GOLD_COLOR : "#f5f2eb",
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(marker.halo, {
      attr: { r: isActive ? TIMELINE_ACTIVE_HALO : TIMELINE_BASE_HALO },
      opacity: isActive ? 0.22 : 0,
      duration: 0.32,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(marker.connector, {
      stroke: isActive ? TIMELINE_GOLD_COLOR : TIMELINE_LINE_COLOR,
      opacity: isActive ? 0.9 : 0.55,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(marker.label, {
      fill: isActive ? TIMELINE_GOLD_COLOR : TIMELINE_MUTED_COLOR,
      opacity: isActive ? 1 : 0.76,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });
  }
}

function requestTimelineMarkerUpdate() {
  if (timelineUpdateFrame !== 0) {
    return;
  }

  timelineUpdateFrame = window.requestAnimationFrame(() => {
    timelineUpdateFrame = 0;
    updateTimelineActiveMarker();
  });
}

function renderLostSportsTimeline(root: HTMLElement, animateEntry: boolean) {
  const stage = root.querySelector<HTMLElement>(TIMELINE_STAGE_SELECTOR);
  const content = root.querySelector<HTMLElement>(TIMELINE_CONTENT_SELECTOR);

  if (!stage || !content || stage.clientWidth < 40) {
    if (stage) {
      d3.select(stage).selectAll("*").remove();
    }

    activeTimelineStage = stage ?? null;
    timelineMarkers = [];
    activeTimelineYear = null;
    activeTimelineLine = null;
    return;
  }

  const contentHeight = Math.max(Math.ceil(content.getBoundingClientRect().height), 1);
  stage.style.height = `${contentHeight}px`;

  const stageRect = stage.getBoundingClientRect();
  const cards = getTimelineCards(root);
  const yearMap = new Map<number, number[]>();

  for (const card of cards) {
    const year = Number(card.getAttribute(TIMELINE_YEAR_ATTRIBUTE));

    if (!Number.isFinite(year)) {
      continue;
    }

    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.top + cardRect.height / 2 - stageRect.top;
    const positions = yearMap.get(year) ?? [];
    positions.push(cardCenter);
    yearMap.set(year, positions);
  }

  const timelineYears = normaliseMarkerPositions(
    Array.from(yearMap.entries())
      .sort(([leftYear], [rightYear]) => leftYear - rightYear)
      .map(([year, positions]) => ({
        year,
        y: positions.reduce((sum, value) => sum + value, 0) / positions.length,
      })),
    contentHeight
  );

  const stageSelection = d3.select(stage);
  stageSelection.selectAll("*").remove();

  const stageWidth = Math.max(stage.clientWidth, 80);
  const svg = stageSelection
    .append("svg")
    .attr("width", stageWidth)
    .attr("height", contentHeight)
    .attr("viewBox", `0 0 ${stageWidth} ${contentHeight}`)
    .style("display", "block")
    .style("overflow", "visible");

  const timelineGroup = svg.append("g").attr("aria-hidden", "true");
  const line = timelineGroup
    .append("path")
    .attr("d", `M${TIMELINE_MARKER_X},${TIMELINE_EDGE_PADDING} L${TIMELINE_MARKER_X},${Math.max(contentHeight - TIMELINE_EDGE_PADDING, TIMELINE_EDGE_PADDING)}`)
    .attr("fill", "none")
    .attr("stroke", TIMELINE_LINE_COLOR)
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .node();

  timelineMarkers = timelineYears.map((entry) => {
    const markerGroup = timelineGroup.append("g").attr("transform", `translate(0 ${entry.y})`);
    const connector = markerGroup
      .append("line")
      .attr("x1", TIMELINE_MARKER_X + TIMELINE_INACTIVE_DOT + 4)
      .attr("x2", stageWidth - 4)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", TIMELINE_LINE_COLOR)
      .attr("stroke-width", 1.3)
      .attr("opacity", 0.55)
      .node();
    const halo = markerGroup
      .append("circle")
      .attr("cx", TIMELINE_MARKER_X)
      .attr("cy", 0)
      .attr("r", TIMELINE_BASE_HALO)
      .attr("fill", TIMELINE_GOLD_COLOR)
      .attr("opacity", 0)
      .node();
    const dot = markerGroup
      .append("circle")
      .attr("cx", TIMELINE_MARKER_X)
      .attr("cy", 0)
      .attr("r", TIMELINE_INACTIVE_DOT)
      .attr("fill", "#f5f2eb")
      .node();
    const label = markerGroup
      .append("text")
      .attr("x", TIMELINE_LABEL_X)
      .attr("y", 4)
      .attr("fill", TIMELINE_MUTED_COLOR)
      .attr("font-family", "var(--font-ls-data)")
      .attr("font-size", 10.5)
      .attr("letter-spacing", "0.18em")
      .attr("text-transform", "uppercase")
      .text(entry.year)
      .node();

    return {
      year: entry.year,
      y: entry.y,
      connector: connector as SVGLineElement,
      dot: dot as SVGCircleElement,
      halo: halo as SVGCircleElement,
      label: label as SVGTextElement,
    };
  });

  activeTimelineStage = stage;
  activeTimelineLine = line;
  activeTimelineYear = null;

  if (animateEntry) {
    const drawableLine = prepareLineDraw(line);

    if (drawableLine) {
      gsap.fromTo(
        drawableLine,
        { strokeDashoffset: Number(drawableLine.style.strokeDashoffset || 0) },
        {
          strokeDashoffset: 0,
          duration: TIMELINE_ENTRY_DURATION,
          ease: "power2.inOut",
          overwrite: true,
        }
      );
    }
  } else {
    resetLineDraw(line);
  }

  requestTimelineMarkerUpdate();
}

function requestTimelineRender(animateEntry = false) {
  pendingTimelineAnimation = pendingTimelineAnimation || animateEntry;

  if (timelineRenderFrame !== 0) {
    return;
  }

  timelineRenderFrame = window.requestAnimationFrame(() => {
    timelineRenderFrame = 0;
    const shouldAnimate = pendingTimelineAnimation;
    pendingTimelineAnimation = false;

    if (!activeRoot) {
      return;
    }

    renderLostSportsTimeline(activeRoot, shouldAnimate);
  });
}

function setupLostSportsTimeline(root: HTMLElement) {
  disconnectTimelineObservers();

  const stage = root.querySelector<HTMLElement>(TIMELINE_STAGE_SELECTOR);
  const content = root.querySelector<HTMLElement>(TIMELINE_CONTENT_SELECTOR);

  if (!stage || !content) {
    return;
  }

  requestTimelineRender(true);

  if (typeof ResizeObserver !== "undefined") {
    timelineResizeObserver = new ResizeObserver(() => {
      requestTimelineRender(false);
    });
    timelineResizeObserver.observe(stage);
    timelineResizeObserver.observe(content);
  }

  timelineMutationObserver = new MutationObserver(() => {
    requestTimelineRender(false);

    if (activeRoot) {
      setupCardReveals(activeRoot);
    }
  });
  timelineMutationObserver.observe(content, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("resize", requestTimelineRenderBound);
  window.addEventListener("scroll", requestTimelineMarkerUpdate, { passive: true });
}

function requestTimelineRenderBound() {
  requestTimelineRender(false);
}

function teardownTimeline() {
  window.removeEventListener("resize", requestTimelineRenderBound);
  window.removeEventListener("scroll", requestTimelineMarkerUpdate);
  disconnectTimelineObservers();
  cleanupCardReveals();

  if (activeTimelineLine) {
    resetLineDraw(activeTimelineLine);
  }

  gsap.killTweensOf(
    timelineMarkers.flatMap((marker) => [marker.dot, marker.halo, marker.connector, marker.label])
  );

  if (activeTimelineStage) {
    d3.select(activeTimelineStage).selectAll("*").remove();
    activeTimelineStage.style.removeProperty("height");
  }

  timelineMarkers = [];
  activeTimelineLine = null;
  activeTimelineStage = null;
  activeTimelineYear = null;
  pendingTimelineAnimation = false;
}

export function initLostSports(root: HTMLElement | null) {
  destroyLostSports();

  if (!root) {
    return;
  }

  const scrollButton = root.querySelector<HTMLButtonElement>("[data-ls-scroll-cta]");
  const introSection = root.querySelector<HTMLElement>("[data-ls-intro]");
  activeRoot = root;

  const handleScrollClick = () => {
    introSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  setupLostSportsTimeline(root);
  setupCardReveals(root);
  root.dataset.lostSportsReady = "true";
  scrollButton?.addEventListener("click", handleScrollClick);

  teardownLostSports = () => {
    scrollButton?.removeEventListener("click", handleScrollClick);
    teardownTimeline();
    activeRoot = null;
    delete root.dataset.lostSportsReady;
  };
}

export function destroyLostSports() {
  teardownLostSports?.();
  teardownLostSports = null;
}