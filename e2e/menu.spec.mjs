import {test, expect} from './fixtures.mjs';

const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
};

const gist = {
    id: 'saved1',
    history: [{
        version: 'rev9',
    }],
    files: {
        'astexplorer.json': {
            content: JSON.stringify({
                v: 2,
                toolID: 'putout',
            }),
        },
        'source.js': {
            content: 'const a = 1;',
        },
        'transform.js': {
            content: 'export const report = () => "x";',
        },
    },
};

const openMenu = (page) => page.getByRole('button', {name: 'more'}).click();

test('menu: opens with New, New Filesystem and Save', async ({page}) => {
    await page.goto('/');
    await openMenu(page);
    
    const result = await page.getByRole('menuitem').allTextContents();
    const expected = [
        'New',
        'New Filesystem',
        'Save',
    ];
    
    expect(result).toEqual(expected);
});

test('menu: New Filesystem puts the filesystem source into the Source editor', async ({page}) => {
    await page.goto('/');
    await openMenu(page);
    await page.getByRole('menuitem', {name: 'New Filesystem'}).click();
    await page.getByRole('tab', {name: 'Source'}).click();
    
    await expect(page.locator('.cm-content').first()).toContainText('__putout_processor_filesystem');
});

test('menu: New restores the default source', async ({page}) => {
    await page.goto('/');
    await openMenu(page);
    await page.getByRole('menuitem', {name: 'New Filesystem'}).click();
    await openMenu(page);
    await page.getByRole('menuitem', {name: 'New', exact: true}).click();
    await page.getByRole('tab', {name: 'Source'}).click();
    
    await expect(page.locator('.cm-content').first()).toContainText('Transform your code with');
});

test('menu: Save posts the gist, shows a link and sets the hash', async ({page}) => {
    await page.route('https://putout.cloudcmd.io/api/v1/gist', (route) => {
        if (route.request().method() === 'OPTIONS')
            return route.fulfill({
                status: 204,
                headers: cors,
            });
        
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: cors,
            body: JSON.stringify(gist),
        });
    });
    
    await page.goto('/');
    await openMenu(page);
    await page.getByRole('menuitem', {name: 'Save'}).click();
    
    await expect(page.getByRole('link', {name: 'Putout Editor'})).toHaveAttribute('href', 'https://putout.cloudcmd.io/#/gist/saved1/rev9');
    expect(new URL(page.url()).hash).toBe('#/gist/saved1/rev9');
});
