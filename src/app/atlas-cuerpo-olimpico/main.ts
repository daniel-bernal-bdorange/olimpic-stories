const READY_ATTRIBUTE = "data-body-atlas-ready";
const VIEW_ATTRIBUTE = "data-body-atlas-view";
const SORT_ATTRIBUTE = "data-body-atlas-sort";
const COUNT_ATTRIBUTE = "data-body-atlas-sport-count";

export const BODY_ATLAS_CONTROLS_CHANGE_EVENT = "bodyatlas:controlschange";

let activeRoot: HTMLElement | null = null;
let controlsObserver: MutationObserver | null = null;
let lastPublishedSignature = "";

type BodyAtlasControls = {
  sportCount: number;
  sort: string;
  view: string;
};

function readBodyAtlasControls() {
  if (!activeRoot) {
    return null;
  }

  return {
    sportCount: Number(activeRoot.getAttribute(COUNT_ATTRIBUTE) ?? "0"),
    sort: activeRoot.getAttribute(SORT_ATTRIBUTE) ?? "",
    view: activeRoot.getAttribute(VIEW_ATTRIBUTE) ?? "",
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

export function initBodyAtlas(root: HTMLElement | null, controls: BodyAtlasControls) {
  if (!root) {
    return;
  }

  activeRoot = root;
  lastPublishedSignature = "";
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

  controlsObserver?.disconnect();
  controlsObserver = null;
  lastPublishedSignature = "";
  activeRoot.removeAttribute(READY_ATTRIBUTE);
  activeRoot.removeAttribute(VIEW_ATTRIBUTE);
  activeRoot.removeAttribute(SORT_ATTRIBUTE);
  activeRoot.removeAttribute(COUNT_ATTRIBUTE);
  activeRoot = null;
}