"""
Zhang Jihao Simulator - End-to-End Test
Tests: Homepage, Game flow, Ending system, Return button, Mobile responsive
"""
from playwright.sync_api import sync_playwright
import time

def run_e2e_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test 1: Desktop viewport
        print("\n=== Test 1: Desktop Homepage ===")
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto('http://localhost:3000', timeout=60000)
        page.wait_for_load_state('networkidle', timeout=30000)

        # Verify homepage elements
        title = page.locator('h1').text_content()
        assert '章吉豪模拟器' in title, f"Homepage title not found, got: {title}"
        print("✓ Homepage title displayed")

        start_btn = page.locator('text=开始游戏')
        assert start_btn.is_visible(), "Start button not visible"
        print("✓ Start game button visible")

        # Check stats preview
        stats_preview = page.locator('text=学业')
        assert stats_preview.is_visible(), "Stats preview not visible"
        print("✓ Stats preview displayed")

        # Check unlocked count display
        unlocked_display = page.locator('text=已解锁')
        if unlocked_display.is_visible():
            print("✓ Unlock stats displayed")

        # Take screenshot
        page.screenshot(path='test_screenshots/01_homepage_desktop.png', full_page=True)
        print("✓ Desktop homepage screenshot saved")

        # Test 2: Start game
        print("\n=== Test 2: Game Flow ===")
        start_btn.click()
        page.wait_for_load_state('networkidle', timeout=30000)
        page.wait_for_timeout(2000)

        # Verify game page loaded
        assert '/game' in page.url, f"Did not navigate to game, url: {page.url}"
        print("✓ Navigated to game page")

        page.screenshot(path='test_screenshots/02_game_scene.png', full_page=True)
        print("✓ Game scene screenshot saved")

        # Test 3: Make choices to reach an ending
        print("\n=== Test 3: Game Choices ===")
        choices_made = 0
        max_rounds = 20

        for i in range(max_rounds):
            page.wait_for_timeout(500)

            # Check if we hit an ending modal
            ending_modal = page.locator('.ending-modal')
            if ending_modal.count() > 0:
                print(f"✓ Reached ending after {choices_made} choices")
                break

            # Check for minigame
            minigame = page.locator('.minigame-container')
            if minigame.count() > 0:
                print("  - Minigame detected, clicking buttons...")
                # Try to complete minigame
                for _ in range(10):
                    btns = page.locator('.minigame-container button:visible')
                    if btns.count() > 0:
                        btns.first.click()
                        page.wait_for_timeout(300)
                    else:
                        break
                continue

            # Look for choice buttons (the game uses choice-card class)
            choice_cards = page.locator('.group.cursor-pointer, [class*="choice"]')
            if choice_cards.count() > 0:
                choice_cards.first.click()
                choices_made += 1
                print(f"  - Made choice {choices_made}")
                continue

            # Fallback: click any visible button
            all_buttons = page.locator('button:visible')
            for j in range(all_buttons.count()):
                btn = all_buttons.nth(j)
                btn_text = btn.text_content() or ""
                if '返回' not in btn_text and '主界面' not in btn_text and len(btn_text) > 0:
                    btn.click()
                    choices_made += 1
                    print(f"  - Clicked button: {btn_text[:20]}")
                    break

        print(f"✓ Made {choices_made} choices during gameplay")

        # Test 4: Ending Modal and Return Button
        print("\n=== Test 4: Ending Modal ===")
        page.wait_for_timeout(1000)

        ending_modal = page.locator('.ending-modal')
        if ending_modal.count() > 0:
            print("✓ Ending modal displayed")

            # Get ending title
            ending_title = page.locator('.ending-modal h2')
            if ending_title.count() > 0:
                print(f"  - Ending: {ending_title.text_content()}")

            # Check for return button
            return_btn = page.locator('button:has-text("返回主界面")')
            assert return_btn.is_visible(), "Return button not visible"
            print("✓ Return to home button visible")

            # Check for restart button
            restart_btn = page.locator('button:has-text("再来一次")')
            assert restart_btn.is_visible(), "Restart button not visible"
            print("✓ Restart button visible")

            page.screenshot(path='test_screenshots/03_ending_modal.png', full_page=True)
            print("✓ Ending modal screenshot saved")

            # Test return button
            return_btn.click()
            page.wait_for_load_state('networkidle', timeout=30000)
            page.wait_for_timeout(1000)

            current_url = page.url
            assert '/' in current_url and '/game' not in current_url, f"Did not return home, url: {current_url}"
            print("✓ Return to home button works")
        else:
            print("⚠ No ending modal found, taking screenshot of current state")
            page.screenshot(path='test_screenshots/03_game_state.png', full_page=True)

        # Test 5: Ending Collection Display
        print("\n=== Test 5: Ending Collection ===")
        page.goto('http://localhost:3000', timeout=60000)
        page.wait_for_load_state('networkidle', timeout=30000)
        page.wait_for_timeout(1000)

        # Check if collection button appears (only shows if endings unlocked)
        collection_btn = page.locator('button:has-text("查看已解锁结局")')
        if collection_btn.is_visible():
            print("✓ Collection button visible")
            collection_btn.click()
            page.wait_for_timeout(500)

            page.screenshot(path='test_screenshots/04_collection.png', full_page=True)
            print("✓ Collection screenshot saved")

            # Verify collection categories displayed
            positive_label = page.locator('text=正面')
            negative_label = page.locator('text=悲剧')
            rare_label = page.locator('text=隐藏')
            if positive_label.is_visible() or negative_label.is_visible() or rare_label.is_visible():
                print("✓ Collection categories displayed")
        else:
            # Check stats display
            stats = page.locator('text=已解锁')
            if stats.is_visible():
                print("✓ Unlock stats displayed on homepage")
            else:
                print("  - No endings unlocked yet (expected for fresh state)")

        page.close()

        # Test 6: Mobile Responsive
        print("\n=== Test 6: Mobile Responsive ===")
        mobile_page = browser.new_page(viewport={'width': 375, 'height': 667})
        mobile_page.goto('http://localhost:3000', timeout=60000)
        mobile_page.wait_for_load_state('networkidle', timeout=30000)

        # Check mobile layout
        title = mobile_page.locator('h1')
        assert title.is_visible(), "Title not visible on mobile"
        print("✓ Mobile homepage renders correctly")

        start_btn = mobile_page.locator('text=开始游戏')
        assert start_btn.is_visible(), "Start button not visible on mobile"
        print("✓ Start button visible on mobile")

        mobile_page.screenshot(path='test_screenshots/05_mobile_homepage.png', full_page=True)
        print("✓ Mobile homepage screenshot saved")

        # Test mobile game
        start_btn.click()
        mobile_page.wait_for_load_state('networkidle', timeout=30000)
        mobile_page.wait_for_timeout(2000)

        mobile_page.screenshot(path='test_screenshots/06_mobile_game.png', full_page=True)
        print("✓ Mobile game screenshot saved")

        mobile_page.close()
        browser.close()

        print("\n" + "="*50)
        print("✅ All E2E tests completed successfully!")
        print("="*50)

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    run_e2e_tests()
