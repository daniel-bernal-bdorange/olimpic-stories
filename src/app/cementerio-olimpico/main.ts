import * as d3 from "d3";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lostSportsTimelineEntries, type LostSportEraKey, type LostSportTimelineEntry } from "./data";

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_CONTENT_SELECTOR = "[data-ls-timeline-content]";
const TIMELINE_STAGE_SELECTOR = "[data-ls-timeline-stage]";
const TIMELINE_CARD_SELECTOR = "[data-ls-timeline-card]";
const TIMELINE_CARD_ID_ATTRIBUTE = "data-ls-timeline-id";
const REVEAL_CARD_SELECTOR = "[data-ls-card-reveal]";
const ERA_CARD_SELECTOR = "[data-ls-era-card]";
const ERA_ATTRIBUTE = "data-ls-era";
const CARD_REVEALED_ATTRIBUTE = "data-ls-revealed";
const TIMELINE_EDGE_PADDING = 26;
const TIMELINE_MARKER_X = 46;
const TIMELINE_LABEL_X = 2;
const TIMELINE_NAME_X = 66;
const TIMELINE_CONNECTOR_END_X = 58;
const TIMELINE_LINE_COLOR = "#3a3a3a";
const TIMELINE_MUTED_COLOR = "#b8b0a4";
const TIMELINE_GOLD_COLOR = "#c9a84c";
const TIMELINE_INACTIVE_DOT = 4;
const TIMELINE_ACTIVE_DOT = 5.6;
const TIMELINE_ARCHIVE_DOT = 2.8;
const TIMELINE_BASE_HALO = 9;
const TIMELINE_ACTIVE_HALO = 12.5;
const TIMELINE_MIN_MARKER_GAP = 28;
const TIMELINE_ENTRY_DURATION = 1.35;
const CARD_REVEAL_DISTANCE = 72;
const ERA_DIMMED_AUTO_ALPHA = 0.15;
const TIMELINE_TOOLTIP_OFFSET = 16;

type CardSide = "left" | "right";

type TimelineMarkerNode = {
  id: string;
  year: number;
  sport: string;
  years: string;
  timelineBlurb: string;
  hasCard: boolean;
  cardId: string | null;
  y: number;
  group: SVGGElement;
  connector: SVGLineElement;
  dot: SVGCircleElement;
  halo: SVGCircleElement;
  yearLabel: SVGTextElement;
  sportLabel: SVGTextElement;
};

let teardownLostSports: (() => void) | null = null;
let activeRoot: HTMLElement | null = null;
let timelineResizeObserver: ResizeObserver | null = null;
let timelineMutationObserver: MutationObserver | null = null;
let timelineRenderFrame = 0;
let timelineUpdateFrame = 0;
let pendingTimelineAnimation = false;
let timelineMarkers: TimelineMarkerNode[] = [];
let activeTimelineCardIds = new Set<string>();
let activeTimelineMarkerId: string | null = null;
let activeTimelineStage: HTMLElement | null = null;
let activeTimelineLine: SVGPathElement | null = null;
let timelineTooltip: HTMLDivElement | null = null;
let cardRevealTriggers: ScrollTrigger[] = [];
let activeEraFilter: LostSportEraKey = "all";

type SetupCardRevealsOptions = {
  preserveRevealed?: boolean;
};

function getRevealCards(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(REVEAL_CARD_SELECTOR)).filter((card) => card.isConnected);
}

function getEraCards(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ERA_CARD_SELECTOR)).filter((card) => card.isConnected);
}

function isEraCardActive(card: HTMLElement) {
  return activeEraFilter === "all" || card.getAttribute(ERA_ATTRIBUTE) === activeEraFilter;
}

function getEraCardAutoAlpha(card: HTMLElement) {
  return isEraCardActive(card) ? 1 : ERA_DIMMED_AUTO_ALPHA;
}

function syncEraCardInteractivity(card: HTMLElement, isActive: boolean) {
  if (!isActive) {
    const focusedElement = document.activeElement;

    if (focusedElement instanceof HTMLElement && card.contains(focusedElement)) {
      focusedElement.blur();
    }
  }

  card.style.pointerEvents = isActive ? "" : "none";
}

function applyEraFilter(root: HTMLElement, animate: boolean) {
  const cards = getEraCards(root);

  for (const card of cards) {
    const isActive = isEraCardActive(card);
    syncEraCardInteractivity(card, isActive);

    if (card.dataset.lsRevealed !== "true") {
      continue;
    }

    gsap.killTweensOf(card);

    if (animate) {
      gsap.to(card, {
        autoAlpha: getEraCardAutoAlpha(card),
        duration: 0.42,
        ease: "power2.out",
        overwrite: true,
      });
      continue;
    }

    gsap.set(card, { autoAlpha: getEraCardAutoAlpha(card) });
  }
}

function getCardSide(card: HTMLElement): CardSide {
  return card.dataset.lsCardSide === "right" ? "right" : "left";
}

function cleanupCardReveals() {
  cardRevealTriggers.forEach((trigger) => trigger.kill());
  cardRevealTriggers = [];
}

function setupCardReveals(root: HTMLElement, options: SetupCardRevealsOptions = {}) {
  cleanupCardReveals();

  const cards = getRevealCards(root);
  const preserveRevealed = options.preserveRevealed ?? false;

  for (const card of cards) {
    const side = getCardSide(card);
    const hasRevealed = card.getAttribute(CARD_REVEALED_ATTRIBUTE) === "true";
    syncEraCardInteractivity(card, isEraCardActive(card));

    if (preserveRevealed && hasRevealed) {
      continue;
    }

    card.setAttribute(CARD_REVEALED_ATTRIBUTE, "false");

    gsap.set(card, {
      autoAlpha: 0,
      x: side === "right" ? CARD_REVEAL_DISTANCE : -CARD_REVEAL_DISTANCE,
    });

    const tween = gsap.to(card, {
      autoAlpha: () => getEraCardAutoAlpha(card),
      x: 0,
      duration: 0.82,
      ease: "power3.out",
      overwrite: true,
      onStart: () => {
        card.setAttribute(CARD_REVEALED_ATTRIBUTE, "true");
        syncEraCardInteractivity(card, isEraCardActive(card));
      },
      onComplete: () => {
        syncEraCardInteractivity(card, isEraCardActive(card));
      },
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

function getTimelineCards(root: HTMLElement, activeOnly = false): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TIMELINE_CARD_SELECTOR)).filter(
    (card) => card.isConnected && (!activeOnly || isEraCardActive(card))
  );
}

function updateActiveTimelineCards(root: HTMLElement) {
  activeTimelineCardIds = new Set(
    getTimelineCards(root, true)
      .map((card) => card.getAttribute(TIMELINE_CARD_ID_ATTRIBUTE))
      .filter((cardId): cardId is string => Boolean(cardId))
  );
}

function ensureTimelineTooltip() {
  if (timelineTooltip || typeof document === "undefined") {
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.style.left = "0";
  tooltip.style.top = "0";
  tooltip.style.zIndex = "80";
  tooltip.style.pointerEvents = "none";
  tooltip.style.opacity = "0";
  tooltip.style.transform = "translate3d(0, 8px, 0)";
  tooltip.style.transition = "opacity 140ms ease, transform 140ms ease";
  tooltip.style.padding = "0.7rem 0.85rem";
  tooltip.style.border = "1px solid rgba(201,168,76,0.24)";
  tooltip.style.borderRadius = "0.95rem";
  tooltip.style.background = "linear-gradient(180deg, rgba(9,9,9,0.94), rgba(9,9,9,0.9))";
  tooltip.style.boxShadow = "0 14px 40px rgba(0,0,0,0.28)";
  tooltip.style.backdropFilter = "blur(10px)";
  document.body.appendChild(tooltip);
  timelineTooltip = tooltip;
}

function hideTimelineTooltip() {
  if (!timelineTooltip) {
    return;
  }

  timelineTooltip.style.opacity = "0";
  timelineTooltip.style.transform = "translate3d(0, 8px, 0)";
}

function positionTimelineTooltip(clientX: number, clientY: number) {
  if (!timelineTooltip) {
    return;
  }

  const tooltipRect = timelineTooltip.getBoundingClientRect();
  const maxX = Math.max(window.innerWidth - tooltipRect.width - 12, 12);
  const maxY = Math.max(window.innerHeight - tooltipRect.height - 12, 12);
  const nextLeft = Math.min(clientX + TIMELINE_TOOLTIP_OFFSET, maxX);
  const nextTop = Math.min(clientY + TIMELINE_TOOLTIP_OFFSET, maxY);

  timelineTooltip.style.left = `${nextLeft}px`;
  timelineTooltip.style.top = `${nextTop}px`;
}

function showTimelineTooltip(entry: LostSportTimelineEntry, clientX: number, clientY: number) {
  ensureTimelineTooltip();

  if (!timelineTooltip) {
    return;
  }

  const editionLabel = entry.editions === 1 ? "1 edition" : `${entry.editions} editions`;

  timelineTooltip.innerHTML = `
    <div style="font-family: var(--font-ls-data); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: ${TIMELINE_GOLD_COLOR}; white-space: nowrap;">${entry.sport}</div>
    <div style="margin-top: 0.28rem; font-family: var(--font-ls-data); font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${TIMELINE_MUTED_COLOR}; white-space: nowrap;">${entry.years} · ${editionLabel}</div>
    <div style="margin-top: 0.3rem; font-family: var(--font-ls-data); font-size: 0.64rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(245,242,235,0.56); white-space: nowrap;">Timeline archive only</div>
  `;

  positionTimelineTooltip(clientX, clientY);
  timelineTooltip.style.opacity = "1";
  timelineTooltip.style.transform = "translate3d(0, 0, 0)";
}

function normaliseMarkerPositions<T extends { y: number }>(entries: T[], height: number) {
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

function getTimelineCardPositions(root: HTMLElement, stageTop: number) {
  const cardPositions = new Map<string, number>();

  for (const card of getTimelineCards(root)) {
    const cardId = card.getAttribute(TIMELINE_CARD_ID_ATTRIBUTE);

    if (!cardId) {
      continue;
    }

    const cardRect = card.getBoundingClientRect();
    cardPositions.set(cardId, cardRect.top + cardRect.height / 2 - stageTop);
  }

  return cardPositions;
}

function resolveTimelineMarkerPositions(cardPositions: Map<string, number>, height: number) {
  const positionedEntries = lostSportsTimelineEntries.map((entry) => ({
    entry,
    y: entry.cardId ? cardPositions.get(entry.cardId) ?? null : null,
  }));

  if (positionedEntries.length === 0) {
    return [];
  }

  let lastKnownIndex = -1;

  for (let index = 0; index < positionedEntries.length; index += 1) {
    if (positionedEntries[index].y === null) {
      continue;
    }

    if (lastKnownIndex === -1) {
      for (let fillIndex = index - 1; fillIndex >= 0; fillIndex -= 1) {
        positionedEntries[fillIndex].y = positionedEntries[fillIndex + 1].y! - TIMELINE_MIN_MARKER_GAP;
      }
    } else if (index - lastKnownIndex > 1) {
      const start = positionedEntries[lastKnownIndex].y!;
      const end = positionedEntries[index].y!;
      const step = (end - start) / (index - lastKnownIndex);

      for (let fillIndex = lastKnownIndex + 1; fillIndex < index; fillIndex += 1) {
        positionedEntries[fillIndex].y = start + step * (fillIndex - lastKnownIndex);
      }
    }

    lastKnownIndex = index;
  }

  if (lastKnownIndex === -1) {
    const availableHeight = Math.max(height - TIMELINE_EDGE_PADDING * 2, 1);
    const step = positionedEntries.length > 1 ? availableHeight / (positionedEntries.length - 1) : 0;

    return positionedEntries.map(({ entry }, index) => ({
      entry,
      y: TIMELINE_EDGE_PADDING + step * index,
    }));
  }

  for (let index = lastKnownIndex + 1; index < positionedEntries.length; index += 1) {
    positionedEntries[index].y = positionedEntries[index - 1].y! + TIMELINE_MIN_MARKER_GAP;
  }

  return normaliseMarkerPositions(
    positionedEntries.map(({ entry, y }) => ({
      entry,
      y: y ?? TIMELINE_EDGE_PADDING,
    })),
    height
  );
}

function scrollTimelineCardIntoView(root: HTMLElement, cardId: string) {
  const card = root.querySelector<HTMLElement>(`${TIMELINE_CARD_SELECTOR}[${TIMELINE_CARD_ID_ATTRIBUTE}="${cardId}"]`);

  if (!card) {
    return;
  }

  card.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function syncTimelineMarkerState(markerId: string | null, animate: boolean) {
  for (const marker of timelineMarkers) {
    const isActive = marker.id === markerId;
    const dotRadius = marker.hasCard ? (isActive ? TIMELINE_ACTIVE_DOT : TIMELINE_INACTIVE_DOT) : TIMELINE_ARCHIVE_DOT;
    const dotFill = marker.hasCard ? TIMELINE_GOLD_COLOR : TIMELINE_LINE_COLOR;
    const haloRadius = marker.hasCard && isActive ? TIMELINE_ACTIVE_HALO : TIMELINE_BASE_HALO;
    const haloOpacity = marker.hasCard && isActive ? 0.22 : 0;
    const connectorStroke = marker.hasCard ? (isActive ? TIMELINE_GOLD_COLOR : "rgba(201,168,76,0.42)") : TIMELINE_LINE_COLOR;
    const connectorOpacity = marker.hasCard ? (isActive ? 0.9 : 0.34) : 0.2;
    const yearFill = isActive ? TIMELINE_GOLD_COLOR : marker.hasCard ? "rgba(201,168,76,0.78)" : TIMELINE_MUTED_COLOR;
    const yearOpacity = isActive ? 1 : marker.hasCard ? 0.92 : 0.72;
    const sportFill = isActive ? "#ffffff" : marker.hasCard ? "rgba(245,242,235,0.86)" : "rgba(184,176,164,0.82)";
    const sportOpacity = isActive ? 1 : marker.hasCard ? 0.9 : 0.82;

    if (animate) {
      gsap.to(marker.dot, {
        attr: { r: dotRadius },
        fill: dotFill,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(marker.halo, {
        attr: { r: haloRadius },
        opacity: haloOpacity,
        duration: 0.32,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(marker.connector, {
        stroke: connectorStroke,
        opacity: connectorOpacity,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(marker.yearLabel, {
        fill: yearFill,
        opacity: yearOpacity,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(marker.sportLabel, {
        fill: sportFill,
        opacity: sportOpacity,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });

      continue;
    }

    gsap.set(marker.dot, {
      attr: { r: dotRadius },
      fill: dotFill,
      overwrite: true,
    });

    gsap.set(marker.halo, {
      attr: { r: haloRadius },
      opacity: haloOpacity,
      overwrite: true,
    });

    gsap.set(marker.connector, {
      stroke: connectorStroke,
      opacity: connectorOpacity,
      overwrite: true,
    });

    gsap.set(marker.yearLabel, {
      fill: yearFill,
      opacity: yearOpacity,
      overwrite: true,
    });

    gsap.set(marker.sportLabel, {
      fill: sportFill,
      opacity: sportOpacity,
      overwrite: true,
    });
  }
}

function updateTimelineActiveMarker() {
  const stage = activeTimelineStage;
  hideTimelineTooltip();

  if (!stage || timelineMarkers.length === 0) {
    syncTimelineMarkerState(null, false);
    activeTimelineMarkerId = null;
    return;
  }

  const candidateMarkers =
    activeTimelineCardIds.size > 0
      ? timelineMarkers.filter((marker) => marker.cardId !== null && activeTimelineCardIds.has(marker.cardId))
      : timelineMarkers;

  if (candidateMarkers.length === 0) {
    syncTimelineMarkerState(null, false);
    activeTimelineMarkerId = null;
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;

  let nextActiveMarker = candidateMarkers[0];
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const marker of candidateMarkers) {
    const distance = Math.abs(stageRect.top + marker.y - viewportCenter);

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nextActiveMarker = marker;
    }
  }

  if (activeTimelineMarkerId === nextActiveMarker.id) {
    return;
  }

  activeTimelineMarkerId = nextActiveMarker.id;
  syncTimelineMarkerState(nextActiveMarker.id, true);
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
  const previousActiveMarkerId = activeTimelineMarkerId;

  if (!stage || !content || stage.clientWidth < 40) {
    if (stage) {
      d3.select(stage).selectAll("*").remove();
    }

    activeTimelineStage = stage ?? null;
    timelineMarkers = [];
    activeTimelineCardIds = new Set<string>();
    activeTimelineMarkerId = null;
    activeTimelineLine = null;
    return;
  }

  ensureTimelineTooltip();
  updateActiveTimelineCards(root);

  const contentHeight = Math.max(Math.ceil(content.getBoundingClientRect().height), 1);
  stage.style.height = `${contentHeight}px`;

  const stageRect = stage.getBoundingClientRect();
  const cardPositions = getTimelineCardPositions(root, stageRect.top);
  const timelineEntries = resolveTimelineMarkerPositions(cardPositions, contentHeight);

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

  const timelineGroup = svg.append("g");
  const line = timelineGroup
    .append("path")
    .attr("d", `M${TIMELINE_MARKER_X},${TIMELINE_EDGE_PADDING} L${TIMELINE_MARKER_X},${Math.max(contentHeight - TIMELINE_EDGE_PADDING, TIMELINE_EDGE_PADDING)}`)
    .attr("fill", "none")
    .attr("stroke", TIMELINE_LINE_COLOR)
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .node();

  timelineMarkers = timelineEntries.map(({ entry, y }) => {
    const markerGroup = timelineGroup.append("g").attr("transform", `translate(0 ${y})`);
    const connector = markerGroup
      .append("line")
      .attr("x1", TIMELINE_MARKER_X + TIMELINE_INACTIVE_DOT + 4)
      .attr("x2", TIMELINE_CONNECTOR_END_X)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", TIMELINE_LINE_COLOR)
      .attr("stroke-width", 1.3)
      .attr("opacity", entry.hasCard ? 0.34 : 0.2)
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
      .attr("r", entry.hasCard ? TIMELINE_INACTIVE_DOT : TIMELINE_ARCHIVE_DOT)
      .attr("fill", entry.hasCard ? TIMELINE_GOLD_COLOR : TIMELINE_LINE_COLOR)
      .node();
    const yearLabel = markerGroup
      .append("text")
      .attr("x", TIMELINE_LABEL_X)
      .attr("y", 4)
      .attr("fill", entry.hasCard ? "rgba(201,168,76,0.78)" : TIMELINE_MUTED_COLOR)
      .attr("font-family", "var(--font-ls-data)")
      .attr("font-size", 10.5)
      .attr("letter-spacing", "0.18em")
      .attr("text-transform", "uppercase")
      .text(entry.last)
      .node();
    const sportLabel = markerGroup
      .append("text")
      .attr("x", TIMELINE_NAME_X)
      .attr("y", 4)
      .attr("fill", entry.hasCard ? "rgba(245,242,235,0.86)" : "rgba(184,176,164,0.82)")
      .attr("font-family", "var(--font-ls-data)")
      .attr("font-size", entry.hasCard ? 10.4 : 9.8)
      .attr("letter-spacing", "0.08em")
      .text(entry.sport)
      .node();

    const markerGroupNode = markerGroup.node() as SVGGElement;

    markerGroupNode.style.cursor = entry.hasCard ? "pointer" : "help";

    if (entry.hasCard && entry.cardId) {
      markerGroupNode.addEventListener("click", () => {
        scrollTimelineCardIntoView(root, entry.cardId!);
      });
    } else {
      markerGroupNode.addEventListener("mouseenter", (event) => {
        showTimelineTooltip(entry, event.clientX, event.clientY);
      });
      markerGroupNode.addEventListener("mousemove", (event) => {
        positionTimelineTooltip(event.clientX, event.clientY);
      });
      markerGroupNode.addEventListener("mouseleave", () => {
        hideTimelineTooltip();
      });
    }

    return {
      id: entry.id,
      year: entry.last,
      sport: entry.sport,
      years: entry.years,
      timelineBlurb: entry.timelineBlurb,
      hasCard: entry.hasCard,
      cardId: entry.cardId,
      y,
      group: markerGroupNode,
      connector: connector as SVGLineElement,
      dot: dot as SVGCircleElement,
      halo: halo as SVGCircleElement,
      yearLabel: yearLabel as SVGTextElement,
      sportLabel: sportLabel as SVGTextElement,
    };
  });

  const preservedActiveMarkerId =
    previousActiveMarkerId !== null &&
    timelineMarkers.some((marker) => marker.id === previousActiveMarkerId) &&
    timelineMarkers.some(
      (marker) => marker.id === previousActiveMarkerId && marker.cardId !== null && activeTimelineCardIds.has(marker.cardId)
    )
      ? previousActiveMarkerId
      : null;

  activeTimelineStage = stage;
  activeTimelineLine = line;
  activeTimelineMarkerId = preservedActiveMarkerId;
  syncTimelineMarkerState(preservedActiveMarkerId, false);

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
  hideTimelineTooltip();

  if (activeTimelineLine) {
    resetLineDraw(activeTimelineLine);
  }

  gsap.killTweensOf(
    timelineMarkers.flatMap((marker) => [marker.dot, marker.halo, marker.connector, marker.yearLabel, marker.sportLabel])
  );

  if (activeTimelineStage) {
    d3.select(activeTimelineStage).selectAll("*").remove();
    activeTimelineStage.style.removeProperty("height");
  }

  timelineTooltip?.remove();
  timelineTooltip = null;

  timelineMarkers = [];
  activeTimelineCardIds = new Set<string>();
  activeTimelineLine = null;
  activeTimelineStage = null;
  activeTimelineMarkerId = null;
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
  applyEraFilter(root, false);
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
  activeEraFilter = "all";
}

export function setLostSportsEra(root: HTMLElement | null, activeEra: LostSportEraKey) {
  activeEraFilter = activeEra;

  if (!root) {
    return;
  }

  applyEraFilter(root, true);
  setupCardReveals(root, { preserveRevealed: true });
  updateActiveTimelineCards(root);
  requestTimelineMarkerUpdate();
}