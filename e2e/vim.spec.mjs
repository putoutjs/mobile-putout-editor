import {test, expect} from './fixtures.mjs';

test('vim: no fat cursor before any key', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('.cm-content').first()).toBeVisible();
    
    await expect(page.locator('.cm-fat-cursor')).toHaveCount(0);
});

test('vim: Escape turns on vim mode', async ({page}) => {
    await page.goto('/');
    await page.locator('.cm-content').first().click();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('.cm-fat-cursor').first()).toBeVisible();
});
