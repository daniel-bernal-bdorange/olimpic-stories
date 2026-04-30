import { create, easeCubicInOut, select, type Selection } from "d3";

import {
  formatAtlasMetricValue,
  getAtlasMetricLabel,
  getOlympicAverage,
  getSortedAtlasProfiles,
  type AtlasProfile,
  type AtlasView,
  type SortMetric,
} from "./data";

const READY_ATTRIBUTE = "data-body-atlas-ready";
const VIEW_ATTRIBUTE = "data-body-atlas-view";
const SORT_ATTRIBUTE = "data-body-atlas-sort";
const COUNT_ATTRIBUTE = "data-body-atlas-sport-count";

export const BODY_ATLAS_CONTROLS_CHANGE_EVENT = "bodyatlas:controlschange";

let activeRoot: HTMLElement | null = null;
let controlsObserver: MutationObserver | null = null;
let lastPublishedSignature = "";
let controlsChangeHandler: EventListener | null = null;
let hoveredSport: string | null = null;
let focusedSport: string | null = null;
let activeTooltipNode: HTMLDivElement | null = null;
let activeTooltipTarget: HTMLElement | null = null;
let tooltipViewportHandler: (() => void) | null = null;
let lastRenderedControls: BodyAtlasControls | null = null;
let selectionLayerCleanup: (() => void) | null = null;
let selectionReturnFocusNode: HTMLElement | null = null;
let selectionBodyOverflow = "";

const activeSportByView: Partial<Record<AtlasView, string>> = {};

type BodyAtlasControls = {
  sportCount: number;
  sort: SortMetric;
  view: AtlasView;
};

const BODY_ATLAS_STAGE_HEIGHT = 260;
const BODY_ATLAS_STAGE_WIDTH = 120;
const BODY_ATLAS_BASELINE = 236;
const BODY_ATLAS_IMAGE_HEIGHT = 230;
const BODY_ATLAS_IMAGE_WIDTH = 88;
const BODY_ATLAS_GUIDE_LEFT_X = 10;
const BODY_ATLAS_WIDTH_GUIDE_Y = 92;
const BODY_ATLAS_DEFAULT_SILHOUETTE = "#3a3a3a";
const BODY_ATLAS_DEFAULT_BORDER = "rgba(255,255,255,0.10)";
const BODY_ATLAS_DEFAULT_BG = "rgba(255,255,255,0.03)";
const BODY_ATLAS_TOOLTIP_GAP = 14;
const BODY_ATLAS_TOOLTIP_EDGE_OFFSET = 16;
const BODY_ATLAS_SORT_TRANSITION_MS = 600;
const BODY_ATLAS_METRICS: SortMetric[] = ["height", "weight", "bmi"];
const BODY_ATLAS_MOBILE_BREAKPOINT = 768;

type CardVisualState = "default" | "hover" | "active";

type BodyAtlasTooltipData = {
  accent: string;
  bmi: string;
  height: string;
  sport: string;
  weight: string;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return { red: 201, green: 168, blue: 76 };
  }

  const numeric = Number.parseInt(normalized, 16);

  return {
    red: (numeric >> 16) & 255,
    green: (numeric >> 8) & 255,
    blue: numeric & 255,
  };
}

function toRgba(hex: string, alpha: number) {
  const { red, green, blue } = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getSportAccentColor(accent: string | undefined) {
  return accent && accent.trim().length > 0 ? accent : "#C9A84C";
}

function isMobileAtlasViewport() {
  return typeof window !== "undefined" && window.innerWidth < BODY_ATLAS_MOBILE_BREAKPOINT;
}

function getBodyAtlasCssVariable(name: string, fallback: string) {
  if (!activeRoot || typeof window === "undefined") {
    return fallback;
  }

  const value = window.getComputedStyle(activeRoot).getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

function cleanupBodyAtlasSelectionLayer(options: { restoreFocus?: boolean } = {}) {
  selectionLayerCleanup?.();
  selectionLayerCleanup = null;

  if (typeof document !== "undefined") {
    document.body.style.overflow = selectionBodyOverflow;
  }

  selectionBodyOverflow = "";

  if (options.restoreFocus && selectionReturnFocusNode) {
    selectionReturnFocusNode.focus();
  }
}

function ensureBodyAtlasTooltip() {
  if (activeTooltipNode || typeof document === "undefined") {
    return activeTooltipNode;
  }

  const tooltipNode = document.createElement("div");
  tooltipNode.setAttribute("aria-hidden", "true");
  tooltipNode.dataset.state = "hidden";
  tooltipNode.style.position = "fixed";
  tooltipNode.style.left = "0";
  tooltipNode.style.top = "0";
  tooltipNode.style.zIndex = "80";
  tooltipNode.style.pointerEvents = "none";
  tooltipNode.style.width = "min(16rem, calc(100vw - 2rem))";
  tooltipNode.style.border = "1px solid rgba(255,255,255,0.14)";
  tooltipNode.style.borderRadius = "1.25rem";
  tooltipNode.style.background = "rgba(10,10,10,0.94)";
  tooltipNode.style.boxShadow = "0 24px 70px rgba(0,0,0,0.34)";
  tooltipNode.style.backdropFilter = "blur(16px)";
  tooltipNode.style.padding = "0.95rem 1rem";
  tooltipNode.style.opacity = "0";
  tooltipNode.style.transform = "translate3d(0, 8px, 0) scale(0.98)";
  tooltipNode.style.transition = "opacity 160ms ease, transform 180ms ease, border-color 180ms ease";
  tooltipNode.innerHTML = `
    <p data-atlas-tooltip-role="sport" style="margin:0 0 0.7rem 0;font-family:var(--font-atlas-display);font-size:1.55rem;line-height:0.95;text-transform:uppercase;color:#ffffff"></p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.6rem;border-top:1px solid rgba(255,255,255,0.08);padding-top:0.7rem;font-family:var(--font-atlas-data)">
      <div>
        <p style="margin:0 0 0.2rem 0;font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(245,242,235,0.44)">Height</p>
        <p data-atlas-tooltip-role="height" style="margin:0;font-size:0.76rem;letter-spacing:0.08em;text-transform:uppercase;color:#f5f2eb"></p>
      </div>
      <div>
        <p style="margin:0 0 0.2rem 0;font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(245,242,235,0.44)">Weight</p>
        <p data-atlas-tooltip-role="weight" style="margin:0;font-size:0.76rem;letter-spacing:0.08em;text-transform:uppercase;color:#f5f2eb"></p>
      </div>
      <div>
        <p style="margin:0 0 0.2rem 0;font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(245,242,235,0.44)">BMI</p>
        <p data-atlas-tooltip-role="bmi" style="margin:0;font-size:0.76rem;letter-spacing:0.08em;text-transform:uppercase;color:#f5f2eb"></p>
      </div>
    </div>
  `;

  document.body.appendChild(tooltipNode);
  activeTooltipNode = tooltipNode;
  return activeTooltipNode;
}

function readTooltipData(cardNode: HTMLElement): BodyAtlasTooltipData {
  const sport = cardNode.dataset.sport ?? "Sport";
  const accent = getSportAccentColor(cardNode.dataset.accent);
  const height = `${Number(cardNode.dataset.height ?? "0").toFixed(1)} cm`;
  const weight = `${Number(cardNode.dataset.weight ?? "0").toFixed(1)} kg`;
  const bmi = Number(cardNode.dataset.bmi ?? "0").toFixed(1);

  return {
    accent,
    bmi,
    height,
    sport,
    weight,
  };
}

function positionBodyAtlasTooltip(target: HTMLElement) {
  if (!activeTooltipNode || typeof window === "undefined") {
    return;
  }

  const tooltipRect = activeTooltipNode.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const maxLeft = window.innerWidth - tooltipRect.width - BODY_ATLAS_TOOLTIP_EDGE_OFFSET;
  const centeredLeft = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
  const left = Math.min(
    Math.max(centeredLeft, BODY_ATLAS_TOOLTIP_EDGE_OFFSET),
    Math.max(BODY_ATLAS_TOOLTIP_EDGE_OFFSET, maxLeft),
  );
  const preferredTop = targetRect.top - tooltipRect.height - BODY_ATLAS_TOOLTIP_GAP;
  const fallbackTop = targetRect.bottom + BODY_ATLAS_TOOLTIP_GAP;
  const maxTop = window.innerHeight - tooltipRect.height - BODY_ATLAS_TOOLTIP_EDGE_OFFSET;
  const top = preferredTop >= BODY_ATLAS_TOOLTIP_EDGE_OFFSET
    ? preferredTop
    : Math.min(fallbackTop, Math.max(BODY_ATLAS_TOOLTIP_EDGE_OFFSET, maxTop));

  activeTooltipNode.style.left = `${left}px`;
  activeTooltipNode.style.top = `${top}px`;
}

function syncBodyAtlasTooltipPosition() {
  if (activeTooltipTarget) {
    positionBodyAtlasTooltip(activeTooltipTarget);
  }
}

function bindTooltipViewportHandlers() {
  if (tooltipViewportHandler || typeof window === "undefined") {
    return;
  }

  tooltipViewportHandler = () => {
    syncBodyAtlasTooltipPosition();
  };

  window.addEventListener("resize", tooltipViewportHandler);
  window.addEventListener("scroll", tooltipViewportHandler, { passive: true });
}

function unbindTooltipViewportHandlers() {
  if (!tooltipViewportHandler || typeof window === "undefined") {
    return;
  }

  window.removeEventListener("resize", tooltipViewportHandler);
  window.removeEventListener("scroll", tooltipViewportHandler);
  tooltipViewportHandler = null;
}

function showBodyAtlasTooltip(cardNode: HTMLElement) {
  const tooltipNode = ensureBodyAtlasTooltip();

  if (!tooltipNode) {
    return;
  }

  const tooltipData = readTooltipData(cardNode);
  const sportNode = tooltipNode.querySelector<HTMLElement>("[data-atlas-tooltip-role='sport']");
  const heightNode = tooltipNode.querySelector<HTMLElement>("[data-atlas-tooltip-role='height']");
  const weightNode = tooltipNode.querySelector<HTMLElement>("[data-atlas-tooltip-role='weight']");
  const bmiNode = tooltipNode.querySelector<HTMLElement>("[data-atlas-tooltip-role='bmi']");

  if (sportNode) {
    sportNode.textContent = tooltipData.sport;
    sportNode.style.color = tooltipData.accent;
  }

  if (heightNode) {
    heightNode.textContent = tooltipData.height;
  }

  if (weightNode) {
    weightNode.textContent = tooltipData.weight;
  }

  if (bmiNode) {
    bmiNode.textContent = tooltipData.bmi;
  }

  tooltipNode.style.borderColor = toRgba(tooltipData.accent, 0.42);
  activeTooltipTarget = cardNode;
  bindTooltipViewportHandlers();
  positionBodyAtlasTooltip(cardNode);

  requestAnimationFrame(() => {
    if (!activeTooltipNode || activeTooltipTarget !== cardNode) {
      return;
    }

    activeTooltipNode.dataset.state = "visible";
    activeTooltipNode.style.opacity = "1";
    activeTooltipNode.style.transform = "translate3d(0, 0, 0) scale(1)";
  });
}

function hideBodyAtlasTooltip() {
  activeTooltipTarget = null;

  if (!activeTooltipNode) {
    unbindTooltipViewportHandlers();
    return;
  }

  activeTooltipNode.dataset.state = "hidden";
  activeTooltipNode.style.opacity = "0";
  activeTooltipNode.style.transform = "translate3d(0, 8px, 0) scale(0.98)";
  unbindTooltipViewportHandlers();
}

function destroyBodyAtlasTooltip() {
  hideBodyAtlasTooltip();

  if (!activeTooltipNode) {
    return;
  }

  activeTooltipNode.remove();
  activeTooltipNode = null;
}

function applyCardPresentation(cardNode: HTMLElement, accent: string, state: CardVisualState, hasFocus: boolean) {
  const titleNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='sport-name']");
  const metricValueNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='metric-value']");
  const metricLabelNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='metric-label']");
  const detailNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='detail']");
  const stageNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='stage']");
  const silhouetteNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='silhouette']");
  const guideNodes = cardNode.querySelectorAll<SVGLineElement>("[data-atlas-role='guide']");
  const statLabelNodes = cardNode.querySelectorAll<HTMLElement>("[data-atlas-role='stat-label']");
  const statValueNodes = cardNode.querySelectorAll<HTMLElement>("[data-atlas-role='stat-value']");

  const isInteractive = state !== "default";
  const silhouetteColor = isInteractive ? accent : BODY_ATLAS_DEFAULT_SILHOUETTE;
  const titleColor = state === "default" ? "rgba(245,242,235,0.58)" : "#ffffff";
  const metricValueColor = state === "default" ? "#f5f2eb" : "#c9a84c";
  const detailColor = state === "default" ? "rgba(245,242,235,0.68)" : "rgba(245,242,235,0.86)";
  const borderColor = state === "active" ? toRgba(accent, 0.92) : state === "hover" ? toRgba(accent, 0.34) : BODY_ATLAS_DEFAULT_BORDER;
  const background = state === "active"
    ? `linear-gradient(180deg, ${toRgba(accent, 0.18)} 0%, rgba(255,255,255,0.04) 42%, rgba(8,8,8,0.94) 100%)`
    : state === "hover"
      ? `linear-gradient(180deg, ${toRgba(accent, 0.10)} 0%, rgba(255,255,255,0.03) 100%)`
      : BODY_ATLAS_DEFAULT_BG;
  const boxShadow = hasFocus
    ? `0 0 0 2px ${toRgba(accent, 0.98)}, 0 0 0 6px rgba(5,5,5,0.96), 0 24px 70px rgba(0,0,0,0.28)`
    : state === "active"
      ? `0 24px 70px rgba(0,0,0,0.34), 0 0 0 1px ${toRgba(accent, 0.22)}`
      : state === "hover"
        ? `0 20px 60px rgba(0,0,0,0.26), 0 0 0 1px ${toRgba(accent, 0.14)}`
        : "0 18px 60px rgba(0,0,0,0.22)";

  cardNode.style.borderColor = borderColor;
  cardNode.style.background = background;
  cardNode.style.boxShadow = boxShadow;
  cardNode.style.transform = state === "active" ? "translateY(-3px)" : state === "hover" ? "translateY(-1px)" : "translateY(0)";

  if (titleNode) {
    titleNode.style.color = titleColor;
  }

  if (metricValueNode) {
    metricValueNode.style.color = metricValueColor;
  }

  if (metricLabelNode) {
    metricLabelNode.style.color = state === "default" ? "rgba(245,242,235,0.42)" : toRgba(accent, 0.72);
  }

  if (detailNode) {
    detailNode.style.color = detailColor;
  }

  if (stageNode) {
    stageNode.style.borderColor = state === "active" ? toRgba(accent, 0.42) : state === "hover" ? toRgba(accent, 0.22) : "rgba(255,255,255,0.10)";
    stageNode.style.background = state === "active"
      ? "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.10))"
      : state === "hover"
        ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09))"
        : "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))";
  }

  if (silhouetteNode instanceof SVGElement) {
    silhouetteNode.setAttribute("fill", silhouetteColor);
    silhouetteNode.style.filter = state === "active"
      ? `drop-shadow(0 0 8px ${silhouetteColor})`
      : state === "hover"
        ? `drop-shadow(0 0 4px ${silhouetteColor})`
        : "none";
  }

  guideNodes.forEach((guideNode) => {
    guideNode.style.stroke = state === "default" ? "rgba(201,168,76,0.28)" : toRgba(accent, state === "active" ? 0.5 : 0.34);
  });

  statLabelNodes.forEach((labelNode) => {
    labelNode.style.color = state === "default" ? "rgba(245,242,235,0.46)" : "rgba(245,242,235,0.62)";
  });

  statValueNodes.forEach((valueNode) => {
    valueNode.style.color = state === "default" ? "rgba(245,242,235,0.76)" : "#f5f2eb";
  });
}

function syncBodyAtlasCardStates(view: AtlasView) {
  if (!activeRoot) {
    return;
  }

  const selectedSport = activeSportByView[view] ?? null;

  activeRoot.querySelectorAll<HTMLElement>("[data-atlas-card='true']").forEach((cardNode) => {
    const sport = cardNode.dataset.sport ?? "";
    const accent = getSportAccentColor(cardNode.dataset.accent);
    const isActive = sport === selectedSport;
    const isHovered = sport === hoveredSport;
    const hasFocus = sport === focusedSport;
    const state: CardVisualState = isActive ? "active" : isHovered || hasFocus ? "hover" : "default";

    cardNode.setAttribute("aria-pressed", String(isActive));
    applyCardPresentation(cardNode, accent, state, hasFocus);
  });
}

function bindBodyAtlasCardInteractions(view: AtlasView) {
  if (!activeRoot) {
    return;
  }

  activeRoot.querySelectorAll<HTMLElement>("[data-atlas-card='true']").forEach((cardNode) => {
    const sport = cardNode.dataset.sport ?? "";

    cardNode.addEventListener("mouseenter", () => {
      hoveredSport = sport;
      showBodyAtlasTooltip(cardNode);
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("mouseleave", () => {
      if (hoveredSport === sport) {
        hoveredSport = null;
      }

      hideBodyAtlasTooltip();
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("focus", () => {
      focusedSport = sport;
      showBodyAtlasTooltip(cardNode);
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("blur", () => {
      if (focusedSport === sport) {
        focusedSport = null;
      }

      hideBodyAtlasTooltip();
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("click", () => {
      selectionReturnFocusNode = cardNode;
      activeSportByView[view] = activeSportByView[view] === sport ? "" : sport;
      syncBodyAtlasCardStates(view);

      const controls = readBodyAtlasControls();

      if (controls && controls.view === view) {
        updateBodyAtlasEditorialLayer(controls);
      }
    });

    cardNode.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      cardNode.click();
    });
  });
}

function isAtlasView(value: string | null): value is AtlasView {
  return value === "male" || value === "female";
}

function isSortMetric(value: string | null): value is SortMetric {
  return value === "height" || value === "weight" || value === "bmi";
}

function readBodyAtlasControls() {
  if (!activeRoot) {
    return null;
  }

  const rawView = activeRoot.getAttribute(VIEW_ATTRIBUTE);
  const rawSort = activeRoot.getAttribute(SORT_ATTRIBUTE);

  if (!isAtlasView(rawView) || !isSortMetric(rawSort)) {
    return null;
  }

  return {
    sportCount: Number(activeRoot.getAttribute(COUNT_ATTRIBUTE) ?? "0"),
    sort: rawSort,
    view: rawView,
  } satisfies BodyAtlasControls;
}

function publishBodyAtlasControls() {
  const controls = readBodyAtlasControls();

  if (!activeRoot || !controls) {
    return;
  }

  const signature = `${controls.view}:${controls.sort}:${controls.sportCount}`;

  if (signature === lastPublishedSignature) {
    return;
  }

  lastPublishedSignature = signature;
  activeRoot.dispatchEvent(
    new CustomEvent<BodyAtlasControls>(BODY_ATLAS_CONTROLS_CHANGE_EVENT, {
      detail: controls,
    }),
  );
}

function observeBodyAtlasControls() {
  if (!activeRoot) {
    return;
  }

  controlsObserver?.disconnect();
  controlsObserver = new MutationObserver((mutations) => {
    const hasRelevantChange = mutations.some(
      ({ attributeName }) =>
        attributeName === VIEW_ATTRIBUTE || attributeName === SORT_ATTRIBUTE || attributeName === COUNT_ATTRIBUTE,
    );

    if (hasRelevantChange) {
      publishBodyAtlasControls();
    }
  });

  controlsObserver.observe(activeRoot, {
    attributeFilter: [COUNT_ATTRIBUTE, SORT_ATTRIBUTE, VIEW_ATTRIBUTE],
    attributes: true,
  });
}

function syncBodyAtlasControls(controls: BodyAtlasControls) {
  if (!activeRoot) {
    return;
  }

  activeRoot.setAttribute(VIEW_ATTRIBUTE, controls.view);
  activeRoot.setAttribute(SORT_ATTRIBUTE, controls.sort);
  activeRoot.setAttribute(COUNT_ATTRIBUTE, String(controls.sportCount));
}

function normalizeToRange(value: number, min: number, max: number, minScale: number, maxScale = 1) {
  if (max <= min) {
    return maxScale;
  }

  const normalized = (value - min) / (max - min);
  return minScale + normalized * (maxScale - minScale);
}

function getSilhouetteAsset(view: AtlasView) {
  return view === "male" ? "/images/silueta-hombre.svg" : "/images/silueta-mujer.svg";
}

function getSilhouetteMaskId(view: AtlasView, sport: string) {
  return `atlas-mask-${view}-${sport.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function getAtlasSummaryText(controls: BodyAtlasControls, profileCount: number) {
  const olympicAverage = getOlympicAverage(controls.view);
  const selectedViewLabel = controls.view === "male" ? "Male" : "Female";

  return {
    hint: `${selectedViewLabel} athletes · sorted by ${getAtlasMetricLabel(controls.sort)}`,
    note: `${profileCount} silhouettes share one baseline. ${formatAtlasMetricValue(controls.sort, olympicAverage[controls.sort])} is the Olympic average for this view, so each card can be read against the active lens at a glance.`,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAtlasMetricDeltaLabel(metric: SortMetric, delta: number) {
  const absoluteDelta = Math.abs(delta).toFixed(1);

  if (absoluteDelta === "0.0") {
    return "On the Olympic average";
  }

  if (metric === "height") {
    return `${absoluteDelta} cm ${delta > 0 ? "above" : "below"}`;
  }

  if (metric === "weight") {
    return `${absoluteDelta} kg ${delta > 0 ? "above" : "below"}`;
  }

  return `${absoluteDelta} BMI points ${delta > 0 ? "above" : "below"}`;
}

function getAtlasEditorialLead(profile: AtlasProfile, controls: BodyAtlasControls) {
  const olympicAverage = getOlympicAverage(controls.view);
  const delta = profile[controls.sort] - olympicAverage[controls.sort];
  const audience = controls.view === "male" ? "male" : "female";
  const sortLabel = getAtlasMetricLabel(controls.sort).toLowerCase();

  if (Math.abs(delta) < 0.05) {
    return `${profile.sport} sits right on the ${audience} Olympic ${sortLabel} baseline, making the editorial story about how the sport distributes that average through shape and movement.`;
  }

  return `${profile.sport} lands ${getAtlasMetricDeltaLabel(controls.sort, delta).toLowerCase()} the ${audience} Olympic ${sortLabel} average, turning the selected silhouette into a readable outlier against the current field.`;
}

function getAtlasComparisonCardsMarkup(profile: AtlasProfile, controls: BodyAtlasControls) {
  const olympicAverage = getOlympicAverage(controls.view);
  const accent = getSportAccentColor(profile.accent);

  return BODY_ATLAS_METRICS.map((metric) => {
    const profileValue = profile[metric];
    const averageValue = olympicAverage[metric];
    const maxValue = Math.max(profileValue, averageValue, 1);
    const profileWidth = Math.max((profileValue / maxValue) * 100, 6);
    const averageWidth = Math.max((averageValue / maxValue) * 100, 6);
    const isActiveMetric = metric === controls.sort;

    return `
      <article class="rounded-[1.5rem] border p-5" style="border-color:${isActiveMetric ? toRgba(accent, 0.38) : "rgba(255,255,255,0.10)"};background:${isActiveMetric ? toRgba(accent, 0.08) : "rgba(255,255,255,0.03)"}">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-[11px] uppercase tracking-[0.28em] text-white/52" style="font-family:var(--font-atlas-data)">${escapeHtml(getAtlasMetricLabel(metric))}</p>
            <p class="mt-3 text-[clamp(2rem,7vw,3rem)] uppercase leading-none text-white" style="font-family:var(--font-atlas-display)">${escapeHtml(formatAtlasMetricValue(metric, profileValue))}</p>
          </div>
          <span class="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/72" style="border-color:${toRgba(accent, isActiveMetric ? 0.42 : 0.18)};font-family:var(--font-atlas-data)">${escapeHtml(getAtlasMetricDeltaLabel(metric, profileValue - averageValue))}</span>
        </div>
        <div class="mt-5 space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-white/54" style="font-family:var(--font-atlas-data)">
              <span>Sport</span>
              <span>${escapeHtml(formatAtlasMetricValue(metric, profileValue))}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/8">
              <div class="h-full rounded-full" style="width:${profileWidth}%;background:${accent}"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-white/44" style="font-family:var(--font-atlas-data)">
              <span>Olympic avg</span>
              <span>${escapeHtml(formatAtlasMetricValue(metric, averageValue))}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/8">
              <div class="h-full rounded-full bg-white/35" style="width:${averageWidth}%"></div>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function closeBodyAtlasEditorialLayer(view: AtlasView, options: { restoreFocus?: boolean } = {}) {
  cleanupBodyAtlasSelectionLayer(options);
  activeSportByView[view] = "";
  syncBodyAtlasCardStates(view);

  const controls = readBodyAtlasControls();

  if (controls && controls.view === view) {
    updateBodyAtlasEditorialLayer(controls);
  }
}

function updateBodyAtlasEditorialLayer(controls: BodyAtlasControls) {
  if (!activeRoot) {
    return;
  }

  const layerNode = activeRoot.querySelector<HTMLElement>("[data-atlas-role='selection-layer']");

  if (!layerNode) {
    return;
  }

  const activeSport = activeSportByView[controls.view] ?? "";

  if (!activeSport) {
    cleanupBodyAtlasSelectionLayer();
    layerNode.innerHTML = "";
    return;
  }

  const profiles = getSortedAtlasProfiles(controls.view, controls.sort);
  const profile = profiles.find((candidate) => candidate.sport === activeSport);

  if (!profile) {
    cleanupBodyAtlasSelectionLayer();
    layerNode.innerHTML = "";
    return;
  }

  cleanupBodyAtlasSelectionLayer();

  const accent = getSportAccentColor(profile.accent);
  const selectedViewLabel = controls.view === "male" ? "Male" : "Female";
  const selectedMetricLabel = getAtlasMetricLabel(controls.sort);
  const lead = getAtlasEditorialLead(profile, controls);
  const panelTop = getBodyAtlasCssVariable("--atlas-panel-top", "9.75rem");
  const isMobilePanel = isMobileAtlasViewport();
  const panelTransform = isMobilePanel ? "translateY(110%)" : "translateX(110%)";
  const panelLayout = isMobilePanel
    ? `left:0.75rem;right:0.75rem;top:${panelTop};bottom:0.75rem;width:auto;max-width:none;border-radius:1.5rem;`
    : `top:${panelTop};right:1rem;bottom:1rem;width:min(30vw, 28rem);max-width:calc(100vw - 2rem);border-radius:2rem;`;

  layerNode.innerHTML = `
    <div data-atlas-role="selection-backdrop" style="position:fixed;left:0;right:0;top:${panelTop};bottom:0;background:rgba(5,5,5,0.4);backdrop-filter:blur(3px);opacity:0;transition:opacity 220ms ease;z-index:60"></div>
    <aside
      data-atlas-role="selection-panel"
      aria-label="Selected sport details"
      aria-live="polite"
      role="dialog"
      style="position:fixed;${panelLayout}border:1px solid ${toRgba(accent, 0.34)};background:linear-gradient(180deg, ${toRgba(accent, 0.12)} 0%, rgba(8,8,8,0.98) 100%);box-shadow:0 28px 90px rgba(0,0,0,0.42);overflow:auto;overscroll-behavior:contain;opacity:0;transform:${panelTransform};transition:transform 280ms ease, opacity 220ms ease;z-index:70">
      <div class="flex min-h-full flex-col p-6 sm:p-8">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <button
            type="button"
            data-atlas-role="selection-close"
            aria-label="Close selected sport details"
            class="self-start rounded-full border border-white/12 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-white/28 hover:text-white"
            style="font-family:var(--font-atlas-data)"
          >
            X Close
          </button>
          <div class="min-w-0 text-left sm:text-right">
            <p class="text-[11px] uppercase tracking-[0.28em]" style="font-family:var(--font-atlas-data);color:${accent}">Olympic comparison</p>
            <p class="mt-3 text-[clamp(1.9rem,8vw,3.4rem)] uppercase leading-[0.92] text-white" style="font-family:var(--font-atlas-display)">${escapeHtml(profile.sport)}</p>
            <p class="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/52" style="font-family:var(--font-atlas-data)">${escapeHtml(selectedViewLabel)} dataset · ${escapeHtml(selectedMetricLabel)} lens</p>
          </div>
        </div>

        <p class="mt-5 text-base italic leading-relaxed text-white/80 sm:text-xl" style="font-family:var(--font-atlas-body)">${escapeHtml(lead)}</p>

        <div class="mt-6 space-y-4">
          ${getAtlasComparisonCardsMarkup(profile, controls)}
        </div>

        <div class="mt-6 rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
          <p class="text-[11px] uppercase tracking-[0.28em]" style="font-family:var(--font-atlas-data);color:${accent}">Editorial layer</p>
          <p class="mt-4 text-3xl uppercase leading-[0.95] text-white" style="font-family:var(--font-atlas-display)">${escapeHtml(profile.cluster)} body logic</p>
          <p class="mt-4 text-xl italic leading-relaxed text-white/82" style="font-family:var(--font-atlas-body)">${escapeHtml(profile.detail)}</p>
        </div>

        <div class="mt-5 border-t border-white/10 pt-5">
          <p class="text-[11px] uppercase tracking-[0.28em] text-white/48" style="font-family:var(--font-atlas-data)">Why it matters</p>
          <p class="mt-3 text-base leading-relaxed text-white/78" style="font-family:var(--font-atlas-body)">${escapeHtml(profile.fact)}</p>
        </div>

        <div class="mt-5 rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
          <p class="text-[11px] uppercase tracking-[0.24em] text-white/48" style="font-family:var(--font-atlas-data)">Reading note</p>
          <p class="mt-2 text-sm leading-relaxed text-white/72" style="font-family:var(--font-atlas-body)">The bars compare the selected sport against the ${escapeHtml(selectedViewLabel.toLowerCase())} Olympic average, so the same silhouette can be read as a size story, a mass story or a density story depending on the active sort.</p>
        </div>
      </div>
    </aside>
  `;

  const backdropNode = layerNode.querySelector<HTMLElement>("[data-atlas-role='selection-backdrop']");
  const panelNode = layerNode.querySelector<HTMLElement>("[data-atlas-role='selection-panel']");
  const closeButton = layerNode.querySelector<HTMLButtonElement>("[data-atlas-role='selection-close']");

  const handleClose = () => {
    closeBodyAtlasEditorialLayer(controls.view, { restoreFocus: true });
  };

  const handleDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    handleClose();
  };

  if (typeof document !== "undefined") {
    selectionBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleDocumentKeydown);
  }

  backdropNode?.addEventListener("click", handleClose);
  closeButton?.addEventListener("click", handleClose);
  selectionLayerCleanup = () => {
    backdropNode?.removeEventListener("click", handleClose);
    closeButton?.removeEventListener("click", handleClose);

    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", handleDocumentKeydown);
    }
  };

  requestAnimationFrame(() => {
    if (backdropNode) {
      backdropNode.style.opacity = "1";
    }

    if (panelNode) {
      panelNode.style.opacity = "1";
      panelNode.style.transform = "translate3d(0, 0, 0)";
    }

    closeButton?.focus();
  });
}

function updateBodyAtlasSummary(controls: BodyAtlasControls, profileCount: number) {
  if (!activeRoot) {
    return;
  }

  const summaryText = getAtlasSummaryText(controls, profileCount);
  const summaryHintNode = activeRoot.querySelector<HTMLElement>("[data-atlas-role='summary-hint']");
  const summaryNoteNode = activeRoot.querySelector<HTMLElement>("[data-atlas-role='summary-note']");

  if (summaryHintNode) {
    summaryHintNode.textContent = summaryText.hint;
  }

  if (summaryNoteNode) {
    summaryNoteNode.textContent = summaryText.note;
  }
}

function updateBodyAtlasCardMetric(cardNode: HTMLElement, profile: AtlasProfile, sort: SortMetric) {
  const metricLabelNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='metric-label']");
  const metricValueNode = cardNode.querySelector<HTMLElement>("[data-atlas-role='metric-value']");

  if (metricLabelNode) {
    metricLabelNode.textContent = getAtlasMetricLabel(sort);
  }

  if (metricValueNode) {
    metricValueNode.textContent = formatAtlasMetricValue(sort, profile[sort]);
  }

  cardNode.setAttribute(
    "aria-label",
    `${profile.sport}. ${formatAtlasMetricValue(sort, profile[sort])}. Press Enter to lock this card.`,
  );
}

function animateBodyAtlasSort(controls: BodyAtlasControls, profiles: AtlasProfile[]) {
  if (!activeRoot) {
    return false;
  }

  const gridNode = activeRoot.querySelector<HTMLElement>("[data-atlas-role='grid']");

  if (!gridNode) {
    return false;
  }

  const cardNodes = Array.from(gridNode.querySelectorAll<HTMLElement>("[data-atlas-card='true']"));

  if (cardNodes.length !== profiles.length) {
    return false;
  }

  const cardMap = new Map(cardNodes.map((cardNode) => [cardNode.dataset.sport ?? "", cardNode]));
  const orderedNodes = profiles.map((profile) => cardMap.get(profile.sport) ?? null);

  if (orderedNodes.some((cardNode) => cardNode === null)) {
    return false;
  }

  hideBodyAtlasTooltip();
  hoveredSport = null;
  focusedSport = null;
  updateBodyAtlasSummary(controls, profiles.length);
  updateBodyAtlasEditorialLayer(controls);

  const firstRects = new Map<HTMLElement, DOMRect>();

  cardNodes.forEach((cardNode) => {
    firstRects.set(cardNode, cardNode.getBoundingClientRect());
  });

  profiles.forEach((profile) => {
    const cardNode = cardMap.get(profile.sport);

    if (!cardNode) {
      return;
    }

    updateBodyAtlasCardMetric(cardNode, profile, controls.sort);
    gridNode.appendChild(cardNode);
  });

  orderedNodes.forEach((cardNode) => {
    if (!cardNode) {
      return;
    }

    const firstRect = firstRects.get(cardNode);
    const lastRect = cardNode.getBoundingClientRect();
    const deltaX = firstRect ? firstRect.left - lastRect.left : 0;
    const deltaY = firstRect ? firstRect.top - lastRect.top : 0;

    select(cardNode).interrupt();
    cardNode.style.setProperty("translate", `${deltaX}px ${deltaY}px`);
  });

  gridNode.getBoundingClientRect();

  orderedNodes.forEach((cardNode) => {
    if (!cardNode) {
      return;
    }

    select(cardNode)
      .transition()
      .duration(BODY_ATLAS_SORT_TRANSITION_MS)
      .ease(easeCubicInOut)
      .style("translate", "0px 0px");
  });

  syncBodyAtlasCardStates(controls.view);
  return true;
}

function renderSilhouetteCard(
  container: Selection<HTMLDivElement, undefined, null, undefined>,
  profile: AtlasProfile,
  view: AtlasView,
  sort: SortMetric,
  minHeight: number,
  maxHeight: number,
  minWeight: number,
  maxWeight: number,
) {
  const accent = getSportAccentColor(profile.accent);
  const card = container
    .append("article")
    .attr("class", "flex h-full cursor-pointer flex-col rounded-[1.5rem] border p-4 text-left transition-[background,border-color,box-shadow,transform] duration-200 ease-out focus:outline-none sm:rounded-[1.75rem] sm:p-6")
    .attr("data-atlas-card", "true")
    .attr("data-sport", profile.sport)
    .attr("data-accent", accent)
    .attr("data-height", profile.height)
    .attr("data-weight", profile.weight)
    .attr("data-bmi", profile.bmi)
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", `${profile.sport}. ${formatAtlasMetricValue(sort, profile[sort])}. Press Enter to lock this card.`)
    .attr("aria-pressed", "false")
    .style("border-color", BODY_ATLAS_DEFAULT_BORDER)
    .style("background", BODY_ATLAS_DEFAULT_BG)
    .style("box-shadow", "0 18px 60px rgba(0,0,0,0.22)");

  const cardHeader = card
    .append("div")
    .attr("class", "grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4");

  const cardTitle = cardHeader.append("div").attr("class", "min-w-0 space-y-2");
  cardTitle
    .append("p")
    .attr("class", "text-[11px] uppercase tracking-[0.3em] transition-colors duration-200")
    .attr("data-atlas-role", "sport-name")
    .style("font-family", "var(--font-atlas-data)")
    .style("color", "rgba(245,242,235,0.58)")
    .text(profile.sport);

  const metricBlock = cardHeader.append("div").attr("class", "min-w-0 text-left sm:min-w-[7rem] sm:text-right");
  metricBlock
    .append("p")
    .attr("class", "text-[10px] uppercase tracking-[0.24em] transition-colors duration-200")
    .attr("data-atlas-role", "metric-label")
    .style("font-family", "var(--font-atlas-data)")
    .style("color", "rgba(245,242,235,0.42)")
    .text(getAtlasMetricLabel(sort));

  metricBlock
    .append("p")
    .attr("class", "mt-2 text-[clamp(2rem,6vw,3rem)] uppercase leading-none transition-colors duration-200")
    .attr("data-atlas-role", "metric-value")
    .style("font-family", "var(--font-atlas-display)")
    .style("color", "#f5f2eb")
    .text(formatAtlasMetricValue(sort, profile[sort]));

  const stage = card
    .append("div")
    .attr("class", "mt-6 flex h-[13rem] items-end justify-center overflow-hidden rounded-[1.25rem] border border-dashed px-1 pb-1 pt-0 transition-[background,border-color] duration-200 sm:h-[18rem] sm:rounded-[1.5rem]")
    .attr("data-atlas-role", "stage")
    .style("border-color", "rgba(255,255,255,0.10)")
    .style("background", "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))");

  const heightScale = normalizeToRange(profile.height, minHeight, maxHeight, 0.68);
  const widthScale = normalizeToRange(profile.weight, minWeight, maxWeight, 0.56, 1.08);
  const renderedHeight = BODY_ATLAS_IMAGE_HEIGHT * heightScale;
  const renderedWidth = BODY_ATLAS_IMAGE_WIDTH * widthScale;
  const topY = BODY_ATLAS_BASELINE - renderedHeight;
  const leftX = BODY_ATLAS_STAGE_WIDTH / 2 - renderedWidth / 2;
  const guideWidth = renderedWidth / 2;

  const silhouetteMaskId = getSilhouetteMaskId(view, profile.sport);

  const silhouetteSvg = stage
    .append("svg")
    .attr("class", "h-full w-full")
    .attr("viewBox", `0 0 ${BODY_ATLAS_STAGE_WIDTH} ${BODY_ATLAS_STAGE_HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMax meet")
    .attr("role", "img")
    .attr("aria-label", `${profile.sport}: ${profile.height.toFixed(1)} centimeters, ${profile.weight.toFixed(1)} kilograms, BMI ${profile.bmi.toFixed(1)}`);

  const defs = silhouetteSvg.append("defs");

  defs
    .append("mask")
    .attr("id", silhouetteMaskId)
    .attr("maskUnits", "userSpaceOnUse")
    .attr("x", leftX)
    .attr("y", topY)
    .attr("width", renderedWidth)
    .attr("height", renderedHeight)
    .append("image")
    .attr("href", getSilhouetteAsset(view))
    .attr("x", leftX)
    .attr("y", topY)
    .attr("width", renderedWidth)
    .attr("height", renderedHeight)
    .attr("preserveAspectRatio", "none");

  silhouetteSvg
    .append("line")
    .attr("x1", 10)
    .attr("x2", BODY_ATLAS_STAGE_WIDTH - 10)
    .attr("y1", BODY_ATLAS_BASELINE)
    .attr("y2", BODY_ATLAS_BASELINE)
    .attr("data-atlas-role", "guide")
    .attr("stroke", "rgba(245,242,235,0.18)")
    .attr("stroke-width", 1);

  silhouetteSvg
    .append("line")
    .attr("x1", BODY_ATLAS_GUIDE_LEFT_X)
    .attr("x2", BODY_ATLAS_GUIDE_LEFT_X)
    .attr("y1", topY)
    .attr("y2", BODY_ATLAS_BASELINE)
    .attr("data-atlas-role", "guide")
    .attr("stroke", "rgba(201,168,76,0.34)")
    .attr("stroke-width", 1.25);

  [topY, BODY_ATLAS_BASELINE].forEach((y) => {
    silhouetteSvg
      .append("line")
      .attr("data-atlas-role", "guide")
      .attr("x1", BODY_ATLAS_GUIDE_LEFT_X - 5)
      .attr("x2", BODY_ATLAS_GUIDE_LEFT_X + 5)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", "rgba(201,168,76,0.34)")
      .attr("stroke-width", 1.25);
  });

  silhouetteSvg
    .append("line")
    .attr("data-atlas-role", "guide")
    .attr("x1", BODY_ATLAS_STAGE_WIDTH / 2 - guideWidth)
    .attr("x2", BODY_ATLAS_STAGE_WIDTH / 2 + guideWidth)
    .attr("y1", BODY_ATLAS_WIDTH_GUIDE_Y)
    .attr("y2", BODY_ATLAS_WIDTH_GUIDE_Y)
    .attr("stroke", "rgba(201,168,76,0.28)")
    .attr("stroke-width", 1.25);

  [BODY_ATLAS_STAGE_WIDTH / 2 - guideWidth, BODY_ATLAS_STAGE_WIDTH / 2 + guideWidth].forEach((x) => {
    silhouetteSvg
      .append("line")
      .attr("data-atlas-role", "guide")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", BODY_ATLAS_WIDTH_GUIDE_Y - 4)
      .attr("y2", BODY_ATLAS_WIDTH_GUIDE_Y + 4)
      .attr("stroke", "rgba(201,168,76,0.28)")
      .attr("stroke-width", 1.25);
  });

  silhouetteSvg
    .append("rect")
    .attr("data-atlas-role", "silhouette")
    .attr("x", leftX)
    .attr("y", topY)
    .attr("width", renderedWidth)
    .attr("height", renderedHeight)
    .attr("fill", BODY_ATLAS_DEFAULT_SILHOUETTE)
    .attr("mask", `url(#${silhouetteMaskId})`)
    .style("transition", "fill 180ms ease, filter 180ms ease");

  const metricsRow = card
    .append("dl")
    .attr("class", "mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.18em]")
    .style("font-family", "var(--font-atlas-data)");

  [
    { label: "Height", value: `${profile.height.toFixed(1)} cm` },
    { label: "Weight", value: `${profile.weight.toFixed(1)} kg` },
    { label: "BMI", value: profile.bmi.toFixed(1) },
  ].forEach(({ label, value }) => {
    const item = metricsRow.append("div").attr("class", "space-y-1");
    item.append("dt").attr("data-atlas-role", "stat-label").style("color", "rgba(245,242,235,0.46)").text(label);
    item.append("dd").attr("data-atlas-role", "stat-value").style("color", "rgba(245,242,235,0.76)").text(value);
  });

  card
    .append("p")
    .attr("class", "mt-4 text-base italic leading-relaxed transition-colors duration-200")
    .attr("data-atlas-role", "detail")
    .style("font-family", "var(--font-atlas-body)")
    .style("color", "rgba(245,242,235,0.68)")
    .text(profile.detail);

  applyCardPresentation(card.node() as HTMLElement, accent, "default", false);
}

function renderBodyAtlasGrid() {
  const controls = readBodyAtlasControls();

  if (!activeRoot || !controls) {
    return;
  }

  const profiles = getSortedAtlasProfiles(controls.view, controls.sort);
  const olympicAverage = getOlympicAverage(controls.view);
  const minHeight = Math.min(...profiles.map((profile) => profile.height));
  const maxHeight = Math.max(...profiles.map((profile) => profile.height));
  const minWeight = Math.min(...profiles.map((profile) => profile.weight));
  const maxWeight = Math.max(...profiles.map((profile) => profile.weight));
  const selectedViewLabel = controls.view === "male" ? "Male" : "Female";
  const shouldAnimateSort =
    lastRenderedControls !== null &&
    lastRenderedControls.view === controls.view &&
    lastRenderedControls.sort !== controls.sort;

  if (activeSportByView[controls.view] && !profiles.some((profile) => profile.sport === activeSportByView[controls.view])) {
    delete activeSportByView[controls.view];
  }

  if (shouldAnimateSort && animateBodyAtlasSort(controls, profiles)) {
    lastRenderedControls = controls;
    return;
  }

  hideBodyAtlasTooltip();

  hoveredSport = null;
  focusedSport = null;

  const shell = create("div").attr("class", "space-y-8");

  const summary = shell
    .append("section")
    .attr("class", "grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-end");

  const summaryLabel = summary.append("div").attr("class", "space-y-2");
  summaryLabel
    .append("p")
    .attr("class", "text-[11px] uppercase tracking-[0.28em] text-[#c9a84c]")
    .style("font-family", "var(--font-atlas-data)")
    .text("Silhouette grid");

  summaryLabel
    .append("p")
    .attr("class", "text-sm uppercase tracking-[0.24em] text-white/72")
    .attr("data-atlas-role", "summary-hint")
    .style("font-family", "var(--font-atlas-data)")
    .text(`${selectedViewLabel} athletes · sorted by ${getAtlasMetricLabel(controls.sort)}`);

  summary
    .append("p")
    .attr("class", "max-w-4xl text-xl italic text-white/78 sm:text-2xl")
    .attr("data-atlas-role", "summary-note")
    .style("font-family", "var(--font-atlas-body)")
    .text(
      `${profiles.length} silhouettes share one baseline. ${formatAtlasMetricValue(controls.sort, olympicAverage[controls.sort])} is the Olympic average for this view, so each card can be read against the active lens at a glance.`,
    );

  summary
    .append("p")
    .attr("class", "text-[11px] uppercase tracking-[0.26em] text-white/48")
    .style("font-family", "var(--font-atlas-data)")
    .text("Hover or tap to preview and select a sport. Press Enter to lock an active card and Escape to close the panel.");

  const grid = shell
    .append("div")
    .attr("class", "grid grid-cols-2 gap-4 xl:grid-cols-4")
    .attr("data-atlas-role", "grid");

  profiles.forEach((profile) => {
    renderSilhouetteCard(grid, profile, controls.view, controls.sort, minHeight, maxHeight, minWeight, maxWeight);
  });

  shell.append("section").attr("data-atlas-role", "selection-layer");

  activeRoot.replaceChildren(shell.node() as Node);
  bindBodyAtlasCardInteractions(controls.view);
  syncBodyAtlasCardStates(controls.view);
  updateBodyAtlasEditorialLayer(controls);
  lastRenderedControls = controls;
}

export function initBodyAtlas(root: HTMLElement | null, controls: BodyAtlasControls) {
  if (!root) {
    return;
  }

  activeRoot = root;
  lastPublishedSignature = "";
  lastRenderedControls = null;
  controlsChangeHandler = () => {
    renderBodyAtlasGrid();
  };

  activeRoot.addEventListener(BODY_ATLAS_CONTROLS_CHANGE_EVENT, controlsChangeHandler);
  activeRoot.setAttribute(READY_ATTRIBUTE, "true");
  observeBodyAtlasControls();
  syncBodyAtlasControls(controls);
  publishBodyAtlasControls();
}

export function updateBodyAtlasControls(controls: BodyAtlasControls) {
  syncBodyAtlasControls(controls);
}

export function destroyBodyAtlas() {
  if (!activeRoot) {
    return;
  }

  if (controlsChangeHandler) {
    activeRoot.removeEventListener(BODY_ATLAS_CONTROLS_CHANGE_EVENT, controlsChangeHandler);
  }

  controlsObserver?.disconnect();
  controlsObserver = null;
  controlsChangeHandler = null;
  hoveredSport = null;
  focusedSport = null;
  selectionReturnFocusNode = null;
  lastPublishedSignature = "";
  lastRenderedControls = null;
  cleanupBodyAtlasSelectionLayer();
  destroyBodyAtlasTooltip();
  activeRoot.removeAttribute(READY_ATTRIBUTE);
  activeRoot.removeAttribute(VIEW_ATTRIBUTE);
  activeRoot.removeAttribute(SORT_ATTRIBUTE);
  activeRoot.removeAttribute(COUNT_ATTRIBUTE);
  activeRoot = null;
}