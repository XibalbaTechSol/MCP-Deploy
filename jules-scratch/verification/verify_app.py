
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")
    page.get_by_role("button", name="Register").click()
    page.get_by_placeholder("Email").click()
    page.get_by_placeholder("Email").fill("test@example.com")
    page.get_by_placeholder("Password").click()
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Register").click()
    page.wait_for_timeout(1000)
    page.get_by_placeholder("Email").click()
    page.get_by_placeholder("Email").fill("test@example.com")
    page.get_by_placeholder("Password").click()
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    page.wait_for_timeout(5000)
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
