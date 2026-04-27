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
