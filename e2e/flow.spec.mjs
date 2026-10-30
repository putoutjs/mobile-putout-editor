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

test('flow: a transform with a broken replace pattern reaches the Cooked tab', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `module.exports.replace = () => ({'__a ? __b': 'if (__a) __b'});`);
    await page.getByRole('tab', {name: 'Cooked'}).click();
    
    await expect(page.locator('.cm-content')).toContainText(`'__a ? __b'`);
});

test('flow: require("path") in the transform is the path module', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `${transformHeader} console.log(require('path').sep);`);
    
    await expect(page.getByRole('alert')).toHaveText('"/"');
});

test('flow: console.log of a function shows its source', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `${transformHeader} console.log(function hello() {});`);
    
    await expect(page.getByRole('alert')).toContainText('function hello');
});

test('flow: console.log of an object with node shows its string form', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `${transformHeader} console.log({node: 1});`);
    
    await expect(page.getByRole('alert')).toHaveText('[object Object]');
});

test('flow: flatlint repairs a transform that does not parse', async ({page}) => {
    await page.goto('/');
    await replaceWith(page, `${transformHeader}\nconst a = [1, 2;`);
    
    await expect(page.locator('.cm-content')).toContainText('[1, 2];');
    await expect(page.getByRole('alert')).toHaveCount(0);
});
