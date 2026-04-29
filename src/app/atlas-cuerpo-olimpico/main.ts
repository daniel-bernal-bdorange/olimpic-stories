const READY_ATTRIBUTE = "data-body-atlas-ready";

let activeRoot: HTMLElement | null = null;

export function initBodyAtlas(root: HTMLElement | null) {
  if (!root) {
    return;
  }

  activeRoot = root;
  activeRoot.setAttribute(READY_ATTRIBUTE, "true");
}

export function destroyBodyAtlas() {
  if (!activeRoot) {
    return;
  }

  activeRoot.removeAttribute(READY_ATTRIBUTE);
  activeRoot = null;
}