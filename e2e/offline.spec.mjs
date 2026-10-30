import {test, expect} from './fixtures.mjs';

const open = async (page, name) => {
    await page.goto('/');
    await page.getByRole('tab', {name}).click();
};

test('offline: AST tab shows the Program of the default source', async ({page}) => {
    await open(page, 'AST');
    
    const editor = page.locator('.cm-content');
    
    await expect(editor).toContainText('"type": "Program"');
    await expect(editor).toContainText('ConditionalExpression');
    await expect(page.getByRole('alert')).toHaveCount(0);
});

test('offline: Source tab result is the transformed default source', async ({page}) => {
    await open(page, 'Source');
    
    const result = page.locator('.cm-content').nth(1);
    
    await expect(result).toContainText('if (');
    await expect(result).toContainText('else');
    await expect(result).not.toContainText('?');
    await expect(page.getByRole('alert')).toHaveCount(0);
});

test('offline: Cooked tab shows the compiled transform', async ({page}) => {
    await open(page, 'Cooked');
    
    await expect(page.locator('.cm-content')).toContainText('module.exports.report');
    await expect(page.getByRole('alert')).toHaveCount(0);
});

test('offline: no request to esm.sh after visiting every tab', async ({page}) => {
    await page.goto('/');
    
    for (const name of ['Source', 'AST', 'Cooked']) {
        await page.getByRole('tab', {name}).click();
        await expect(page.locator('.cm-content').first()).not.toBeEmpty();
    }
    
    const result = page.esmRequests;
    const expected = [];
    
    expect(result).toEqual(expected);
});
