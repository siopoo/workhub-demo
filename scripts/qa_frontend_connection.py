from playwright.sync_api import sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    console_errors: list[str] = []
    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )

    page.goto("http://127.0.0.1:5173")
    page.wait_for_load_state("networkidle")
    page.get_by_text("Amanda Johnson", exact=True).first.wait_for()
    health = page.evaluate(
        "async () => { const response = await fetch('/api/health'); return await response.json(); }"
    )

    assert health == {"status": "ok"}, health
    assert not console_errors, console_errors
    browser.close()

print("Frontend opened and reached FastAPI through the Vite proxy")
