import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BODY_ATLAS_BASE_URL", "http://localhost:3000")


def get_root_state(page):
    return page.locator("#body-atlas-root").evaluate(
        """
        (node) => ({
            ready: node.getAttribute('data-body-atlas-ready'),
            count: node.getAttribute('data-body-atlas-sport-count'),
            sort: node.getAttribute('data-body-atlas-sort'),
            view: node.getAttribute('data-body-atlas-view'),
        })
        """
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1200})
    console_logs = []
    page_errors = []

    page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    try:
        page.goto(f"{BASE_URL}/atlas-cuerpo-olimpico", wait_until="networkidle")

        root = page.locator("#body-atlas-root")
        root.wait_for()
        page.wait_for_function(
            """
            () => {
                const rootNode = document.querySelector('#body-atlas-root');

                return rootNode?.getAttribute('data-body-atlas-view') === 'male'
                    && rootNode?.getAttribute('data-body-atlas-sort') === 'height'
                    && rootNode?.getAttribute('data-body-atlas-sport-count') === '20';
            }
            """
        )

        initial_state = get_root_state(page)
        assert initial_state == {"ready": "true", "count": "20", "sort": "height", "view": "male"}

        page.get_by_role("button", name="Show female athlete dataset").click()
        page.wait_for_function(
            "document.querySelector('#body-atlas-root')?.getAttribute('data-body-atlas-view') === 'female'"
        )

        female_state = get_root_state(page)
        assert female_state["view"] == "female"
        page.get_by_text("Female athletes · sorted by Height").wait_for()

        page.get_by_role("button", name="Sort sports by bmi").click()
        page.wait_for_function(
            "document.querySelector('#body-atlas-root')?.getAttribute('data-body-atlas-sort') === 'bmi'"
        )

        bmi_state = get_root_state(page)
        assert bmi_state == {"ready": "true", "count": "20", "sort": "bmi", "view": "female"}
        page.get_by_text("Female athletes ranked by bmi.", exact=False).wait_for()

        sticky_text = page.get_by_text("Showing 20 sports")
        initial_top = sticky_text.evaluate("node => Math.round(node.getBoundingClientRect().top)")
        assert initial_top > 400, initial_top

        sticky_target_top = sticky_text.evaluate(
            "node => Math.round(node.getBoundingClientRect().top + window.scrollY)"
        )
        page.evaluate(f"window.scrollTo({{ top: {sticky_target_top} - 83, behavior: 'instant' }})")
        page.wait_for_timeout(300)

        top_before = sticky_text.evaluate("node => Math.round(node.getBoundingClientRect().top)")
        assert 70 <= top_before <= 130, top_before

        page.evaluate("window.scrollBy(0, 250)")
        page.wait_for_timeout(300)
        top_after = sticky_text.evaluate("node => Math.round(node.getBoundingClientRect().top)")

        assert abs(top_after - top_before) <= 8, (top_before, top_after)

        first_metric = page.locator("article").first.get_by_text("BMI", exact=False)
        first_metric.wait_for()

        print("Body Atlas controls smoke test passed")
    finally:
        try:
            print(f"ROOT_STATE {get_root_state(page)}")
        except Exception as error:
            print(f"ROOT_STATE_ERROR {error}")

        print("CONSOLE_START")
        print("\n".join(console_logs))
        print("PAGEERROR_START")
        print("\n".join(page_errors))
        browser.close()