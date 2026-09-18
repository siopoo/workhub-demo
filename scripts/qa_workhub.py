from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "screenshots"
SCREENSHOTS.mkdir(exist_ok=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 980}, device_scale_factor=1)
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    page.goto("http://127.0.0.1:5173")
    page.wait_for_load_state("networkidle")
    page.get_by_text("Amanda Johnson", exact=True).first.click()
    page.get_by_placeholder("Message Amanda Johnson").fill(
        "Hi Amanda, I have finished the demo. Could you take a look?"
    )
    page.get_by_role("button", name="Send message").click()
    page.get_by_text(
        "Hi Amanda, I have finished the demo. Could you take a look?", exact=True
    ).last.wait_for()
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_text("Amanda Johnson", exact=True).first.click()
    page.get_by_text(
        "Hi Amanda, I have finished the demo. Could you take a look?", exact=True
    ).last.wait_for()
    page.screenshot(path=str(SCREENSHOTS / "workhub-messages.png"), full_page=True)

    page.get_by_role("button", name="Email", exact=True).click()
    page.wait_for_load_state("networkidle")
    page.get_by_text("Project Meeting", exact=True).click()
    page.get_by_text("Can we review the WorkHub milestones on Monday afternoon?", exact=False).wait_for()
    page.get_by_role("button", name="Reply", exact=True).click()
    page.get_by_placeholder("Write your reply…").fill("Monday afternoon works for me. Thanks!")
    page.get_by_role("button", name="Send reply").click()
    page.get_by_text("Reply sent — it is now in Sent.", exact=True).wait_for()

    page.get_by_role("button", name="Sent", exact=True).click()
    page.get_by_text("Re: Project Meeting", exact=True).first.wait_for()
    page.get_by_role("button", name="Compose email").click()
    page.get_by_label("To", exact=True).fill("john@workhub.demo")
    page.get_by_label("Subject", exact=True).fill("Demo Project")
    page.get_by_placeholder("Write your message…").fill(
        "Hi John,\n\nI have completed the first version of the WorkHub demo.\n\nBest regards,\nPeng"
    )
    page.get_by_role("button", name="Send email").click()
    page.get_by_text("Demo Project", exact=True).first.wait_for()
    page.screenshot(path=str(SCREENSHOTS / "workhub-email.png"), full_page=True)

    assert not console_errors, f"Browser console errors: {console_errors}"
    browser.close()

print("WorkHub browser QA passed")
