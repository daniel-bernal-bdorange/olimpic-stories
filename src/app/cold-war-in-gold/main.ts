import gsap from "gsap";

export function buildSidePickerMarkup(): string {
  return `
    <div class="cw-side-picker" role="presentation">
      <!-- USA Side -->
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

      <!-- USSR Side -->
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

export function initSidePicker(): void {
  const picker = document.querySelector(".cw-side-picker");
  if (!picker) return;

  const usaSide = picker.querySelector(".cw-side--usa") as HTMLElement;
  const ussrSide = picker.querySelector(".cw-side--ussr") as HTMLElement;
  const usaButton = usaSide?.querySelector(".cw-side__button") as HTMLButtonElement;
  const ussrButton = ussrSide?.querySelector(".cw-side__button") as HTMLButtonElement;

  if (!usaSide || !ussrSide) return;

  // ========== ENTRY ANIMATION ==========
  // Both sides enter from their respective sides: USA from left (-100%), USSR from right (+100%)
  gsap.fromTo(
    [usaSide, ussrSide],
    { x: (i) => (i === 0 ? "-100%" : "100%") },
    {
      x: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
    }
  );

  // ========== HOVER EXPANSION (CSS FLEX BASED) ==========
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

  // ========== BUTTON CLICK HANDLERS ==========
  const handleSideChoice = async (side: "usa" | "ussr") => {
    // Set CSS variables based on chosen side
    const root = document.documentElement;
    if (side === "usa") {
      root.style.setProperty("--player-color", "#B22234");
      root.style.setProperty("--enemy-color", "#CC0000");
      root.style.setProperty("--player-label", '"USA"');
      root.style.setProperty("--enemy-label", '"USSR"');
      root.style.setProperty("--victory-word", '"VICTORY"');
      root.style.setProperty("--defeat-word", '"DEFEAT"');
    } else {
      root.style.setProperty("--player-color", "#CC0000");
      root.style.setProperty("--enemy-color", "#B22234");
      root.style.setProperty("--player-label", '"USSR"');
      root.style.setProperty("--enemy-label", '"USA"');
      root.style.setProperty("--victory-word", '"VICTORY"');
      root.style.setProperty("--defeat-word", '"DEFEAT"');
    }

    // Animate the picker out: translateY -100vh
    await gsap.to(picker, {
      y: "-100vh",
      duration: 0.6,
      ease: "power2.inOut",
    });

    // Remove from DOM and release scroll
    picker.remove();
    document.body.style.overflow = "";
  };

  usaButton?.addEventListener("click", () => handleSideChoice("usa"));
  ussrButton?.addEventListener("click", () => handleSideChoice("ussr"));
}
