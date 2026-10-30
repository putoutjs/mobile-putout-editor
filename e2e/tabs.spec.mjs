import {test, expect} from './fixtures.mjs';

test('tabs: four tabs in order', async ({page}) => {
    await page.goto('/');
    
    const result = await page.getByRole('tab').allTextContents();
    const expected = [
        'Transform',
        'Source',
        'AST',
        'Cooked',
    ];
    
    expect(result).toEqual(expected);
});

test('tabs: Transform is selected on load', async ({page}) => {
    await page.goto('/');
    
    await expect(page.getByRole('tab', {name: 'Transform'})).toHaveAttribute('aria-selected', 'true');
});

test('tabs: switching a tab changes aria-selected', async ({page}) => {
    await page.goto('/');
    await page.getByRole('tab', {name: 'AST'}).click();
    
    const result = await page.getByRole('tab').evaluateAll((tabs) => tabs.map((tab) => tab.getAttribute('aria-selected')));
    const expected = [
        'false',
        'false',
        'true',
        'false',
    ];
    
    expect(result).toEqual(expected);
});

test('tabs: Source tab has two editors: source and result', async ({page}) => {
    await page.goto('/');
    await page.getByRole('tab', {name: 'Source'}).click();
    
    await expect(page.locator('.cm-content')).toHaveCount(2);
});
