import {test, expect} from './fixtures.mjs';

const replaceWith = async (page, text) => {
    await page.locator('.cm-content').first().click();
    await page.keyboard.press('Control+a');
    await page.keyboard.insertText(text);
};

const transformHeader = `module.exports.report = () => 'x'; module.exports.replace = () => ({});`;

test('flow: typing into the Source editor updates the result panel', async ({page}) => {
    await page.goto('/');
    await page.getByRole('tab', {name: 'Source'}).click();
    await replaceWith(page, 'a ? b : c;');
    
    await expect(page.locator('.cm-content').nth(1)).toContainText('else');
});

test('flow: a transform that throws shows an error alert', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `throw Error('boom');`);
    
    await expect(page.getByRole('alert')).toHaveText('Error: boom');
});

test('flow: console.log in the transform shows an info alert', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `${transformHeader} console.log('hi');`);
    
    await expect(page.getByRole('alert')).toHaveText('"hi"');
});

test('flow: invalid source shows an error alert and keeps the previous result', async ({page}) => {
    await page.goto('/');
    await page.getByRole('tab', {name: 'Source'}).click();
    await replaceWith(page, 'const = ;');
    
    await expect(page.getByRole('alert')).not.toBeEmpty();
    await expect(page.locator('.cm-content').nth(1)).toContainText('else');
});
