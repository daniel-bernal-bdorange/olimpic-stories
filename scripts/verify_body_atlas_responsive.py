import os

from playwright.sync_api import expect, sync_playwright

BASE_URL = os.environ.get("BODY_ATLAS_BASE_URL", "http://localhost:3000")
VIEWPORTS = [
    (390, 844, "mobile"),
    (768, 1024, "tablet"),
    (1440, 1200, "desktop"),
]


def wait_until_ready(page):
    page.goto(f"{BASE_URL}/atlas-cuerpo-olimpico", wait_until="networkidle")
    root = page.locator("#body-atlas-root")
    root.wait_for()
    page.wait_for_function(
        """
        () => {
            const rootNode = document.querySelector('#body-atlas-root');
            return rootNode?.getAttribute('data-body-atlas-ready') === 'true';
        }
        """
    )
    root.scroll_into_view_if_needed()
    page.wait_for_timeout(250)


def grid_layout_signature(page):
    return page.locator("[data-atlas-role='grid']").evaluate(
        """
        (grid) => {
            const cards = Array.from(grid.querySelectorAll("[data-atlas-card='true']")).slice(0, 5);
            return cards.map((card) => Math.round(card.getBoundingClientRect().top));
        }
        """
    )


def active_sport(page):
    return page.locator("[data-atlas-role='selection-panel']").locator("p").nth(1).inner_text().strip()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    console_logs = []
    page_errors = []

    page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    try:
        for width, height, label in VIEWPORTS:
            page.set_viewport_size({"width": width, "height": height})
            wait_until_ready(page)

            tops = grid_layout_signature(page)
            if label in {"mobile", "tablet"}:
                assert len(tops) >= 3 and tops[0] == tops[1] and tops[2] > tops[0], (label, tops)
            else:
                assert len(tops) >= 5 and len({tops[0], tops[1], tops[2], tops[3]}) == 1 and tops[4] > tops[0], (label, tops)

            cards = page.locator("[data-atlas-card='true']")
            first_card = cards.nth(0)
            second_card = cards.nth(1)
            first_card.focus()
            page.keyboard.press("Enter")

            panel = page.locator("[data-atlas-role='selection-panel']")
            backdrop = page.locator("[data-atlas-role='selection-backdrop']")
            close_button = page.get_by_role("button", name="Close selected sport details")
            expect(panel).to_be_visible()
            expect(backdrop).to_be_visible()
            expect(close_button).to_be_visible()
            expect(panel.get_by_text("Height", exact=True)).to_be_visible()
            expect(panel.get_by_text("Weight", exact=True)).to_be_visible()
            expect(panel.get_by_text("BMI", exact=True)).to_be_visible()

            controls_bottom = page.locator("[aria-label='Sort sports by metric']").evaluate(
                "node => Math.round(node.getBoundingClientRect().bottom)"
            )
            panel_box = panel.bounding_box()
            assert panel_box is not None
            assert panel_box["y"] >= controls_bottom - 2, (label, panel_box["y"], controls_bottom)

            if label == "mobile":
                assert panel_box["width"] >= width - 40, (label, panel_box["width"], width)

            first_name = active_sport(page)
            page.keyboard.press("Escape")
            expect(panel).to_have_count(0)
            focused_sport = page.evaluate(
                """
                () => document.activeElement?.getAttribute('data-sport')
                """
            )
            assert focused_sport, (label, "focus_return")

            second_card.click()
            expect(panel).to_be_visible()
            second_name = active_sport(page)
            assert first_name != second_name, (label, first_name, second_name)
            backdrop.click(position={"x": 8, "y": 8})
            expect(panel).to_have_count(0)

        if page_errors:
            raise AssertionError(f"Page errors detected: {page_errors}")

        print("Body Atlas responsive smoke test passed for 390/768/1440")
    finally:
        print("CONSOLE_START")
        print("\n".join(console_logs))
        print("PAGEERROR_START")
        print("\n".join(page_errors))
        browser.close()
