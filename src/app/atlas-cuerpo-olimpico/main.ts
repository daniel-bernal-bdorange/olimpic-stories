import { create, type Selection } from "d3";

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

type CardVisualState = "default" | "hover" | "active";

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
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("mouseleave", () => {
      if (hoveredSport === sport) {
        hoveredSport = null;
      }

      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("focus", () => {
      focusedSport = sport;
      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("blur", () => {
      if (focusedSport === sport) {
        focusedSport = null;
      }

      syncBodyAtlasCardStates(view);
    });

    cardNode.addEventListener("click", () => {
      activeSportByView[view] = activeSportByView[view] === sport ? "" : sport;
      syncBodyAtlasCardStates(view);
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
    .attr("class", "flex h-full cursor-pointer flex-col rounded-[1.75rem] border p-6 text-left transition-[background,border-color,box-shadow,transform] duration-200 ease-out focus:outline-none")
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
    .attr("class", "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4");

  const cardTitle = cardHeader.append("div").attr("class", "min-w-0 space-y-2");
  cardTitle
    .append("p")
    .attr("class", "text-[11px] uppercase tracking-[0.3em] transition-colors duration-200")
    .attr("data-atlas-role", "sport-name")
    .style("font-family", "var(--font-atlas-data)")
    .style("color", "rgba(245,242,235,0.58)")
    .text(profile.sport);

  const metricBlock = cardHeader.append("div").attr("class", "min-w-[7rem] text-right");
  metricBlock
    .append("p")
    .attr("class", "text-[10px] uppercase tracking-[0.24em] transition-colors duration-200")
    .attr("data-atlas-role", "metric-label")
    .style("font-family", "var(--font-atlas-data)")
    .style("color", "rgba(245,242,235,0.42)")
    .text(getAtlasMetricLabel(sort));

  metricBlock
    .append("p")
    .attr("class", "mt-2 text-3xl uppercase leading-none transition-colors duration-200")
    .attr("data-atlas-role", "metric-value")
    .style("font-family", "var(--font-atlas-display)")
    .style("color", "#f5f2eb")
    .text(formatAtlasMetricValue(sort, profile[sort]));

  const stage = card
    .append("div")
    .attr("class", "mt-6 flex h-[18rem] items-end justify-center overflow-hidden rounded-[1.5rem] border border-dashed px-1 pb-1 pt-0 transition-[background,border-color] duration-200")
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

  if (activeSportByView[controls.view] && !profiles.some((profile) => profile.sport === activeSportByView[controls.view])) {
    delete activeSportByView[controls.view];
  }

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
    .style("font-family", "var(--font-atlas-data)")
    .text(`${selectedViewLabel} athletes · sorted by ${getAtlasMetricLabel(controls.sort)}`);

  summary
    .append("p")
    .attr("class", "max-w-4xl text-xl italic text-white/78 sm:text-2xl")
    .style("font-family", "var(--font-atlas-body)")
    .text(
      `${profiles.length} silhouettes share one baseline. ${formatAtlasMetricValue(controls.sort, olympicAverage[controls.sort])} is the Olympic average for this view, so each card can be read against the active lens at a glance.`,
    );

  summary
    .append("p")
    .attr("class", "text-[11px] uppercase tracking-[0.26em] text-white/48")
    .style("font-family", "var(--font-atlas-data)")
    .text("Hover to preview each sport color. Click or press Enter to lock an active card.");

  const grid = shell.append("div").attr("class", "grid gap-4 md:grid-cols-2 xl:grid-cols-4");

  profiles.forEach((profile) => {
    renderSilhouetteCard(grid, profile, controls.view, controls.sort, minHeight, maxHeight, minWeight, maxWeight);
  });

  activeRoot.replaceChildren(shell.node() as Node);
  bindBodyAtlasCardInteractions(controls.view);
  syncBodyAtlasCardStates(controls.view);
}

export function initBodyAtlas(root: HTMLElement | null, controls: BodyAtlasControls) {
  if (!root) {
    return;
  }

  activeRoot = root;
  lastPublishedSignature = "";
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
  lastPublishedSignature = "";
  activeRoot.removeAttribute(READY_ATTRIBUTE);
  activeRoot.removeAttribute(VIEW_ATTRIBUTE);
  activeRoot.removeAttribute(SORT_ATTRIBUTE);
  activeRoot.removeAttribute(COUNT_ATTRIBUTE);
  activeRoot = null;
}