let teardownLostSports: (() => void) | null = null;

export function initLostSports(root: HTMLElement | null) {
  destroyLostSports();

  if (!root) {
    return;
  }

  const scrollButton = root.querySelector<HTMLButtonElement>("[data-ls-scroll-cta]");
  const introSection = root.querySelector<HTMLElement>("[data-ls-intro]");

  const handleScrollClick = () => {
    introSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  root.dataset.lostSportsReady = "true";
  scrollButton?.addEventListener("click", handleScrollClick);

  teardownLostSports = () => {
    scrollButton?.removeEventListener("click", handleScrollClick);
    delete root.dataset.lostSportsReady;
  };
}

export function destroyLostSports() {
  teardownLostSports?.();
  teardownLostSports = null;
}