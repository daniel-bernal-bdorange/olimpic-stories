import { coldWarMedalData } from "./data";

let activeContainer: HTMLDivElement | null = null;

function setInitialTheme(root: HTMLDivElement): void {
  root.style.setProperty("--player-color", "#B22234");
  root.style.setProperty("--enemy-color", "#CC0000");
  root.style.setProperty("--player-label", "USA");
  root.style.setProperty("--enemy-label", "USSR");
  root.style.setProperty("--victory-word", "VICTORY");
  root.style.setProperty("--defeat-word", "DEFEAT");
  root.style.setProperty("--player-flag-accent", "#B22234");
}

function buildBaseMarkup(): string {
  return `
    <div class="cw-layout">
      <section class="cw-hero" aria-labelledby="cw-hero-title">
        <p class="cw-kicker">Data Story 01</p>
        <h1 id="cw-hero-title" class="cw-title">Cold War in Gold</h1>
        <p class="cw-subtitle">1952 - 2020 | The rivalry that shaped the medal table</p>
      </section>

      <section class="cw-stage" aria-labelledby="cw-stage-title">
        <h2 id="cw-stage-title" class="cw-stage__title">Story shell ready</h2>
        <p class="cw-stage__copy">
          CWG-01 is active: this route now uses local HTML structure, scoped CSS custom properties, and
          dedicated typography tokens for the Cold War story.
        </p>
        <p class="cw-stage__meta">
          Dataset loaded: ${coldWarMedalData.length} Olympic editions with USA vs USSR/Russia gold medals.
        </p>
      </section>
    </div>
  `;
}

export function initColdWar(container: HTMLDivElement): void {
  activeContainer = container;
  setInitialTheme(container);
  container.innerHTML = buildBaseMarkup();
}

export function destroyColdWar(): void {
  if (!activeContainer) {
    return;
  }

  activeContainer.innerHTML = "";
  activeContainer = null;
}
