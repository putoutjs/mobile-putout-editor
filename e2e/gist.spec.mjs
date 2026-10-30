import {test, expect} from './fixtures.mjs';

const cors = {
    'access-control-allow-origin': '*',
};

const gist = {
    id: 'abc',
    history: [{
        version: 'rev1',
    }],
    files: {
        'astexplorer.json': {
            content: JSON.stringify({
                v: 2,
                toolID: 'putout',
            }),
        },
        'source.js': {
            content: 'const fromGist = 1;',
        },
        'transform.js': {
            content: `export const report = () => 'from gist';\nexport const replace = () => ({});`,
        },
    },
};

const mockGist = (page, {status = 200, body = gist, hold} = {}) => page.route('https://putout.cloudcmd.io/api/v1/gist/**', async (route) => {
    if (hold)
        await hold;
    
    await route.fulfill({
        status,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify(body),
    });
});

test('gist: opening a gist fills the Transform editor', async ({page}) => {
    await mockGist(page);
    await page.goto('/#/gist/abc/rev1');
    
    await expect(page.locator('.cm-content').first()).toContainText('from gist');
});

test('gist: opening a gist fills the Source editor', async ({page}) => {
    await mockGist(page);
    await page.goto('/#/gist/abc/rev1');
    await page.getByRole('tab', {name: 'Source'}).click();
    
    await expect(page.locator('.cm-content').first()).toContainText('fromGist');
});

test('gist: the progress bar is visible until the gist answers', async ({page}) => {
    let release;
    const hold = new Promise((resolve) => {
        release = resolve;
    });
    
    await mockGist(page, {
        hold,
    });
    
    await page.goto('/#/gist/abc/rev1');
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    release();
    
    await expect(page.getByRole('progressbar')).toHaveCount(0);
});

for (const status of [404, 500]) {
    test(`gist: a ${status} leaves the Transform editor empty`, async ({page}) => {
        const errors = [];
        
        page.on('pageerror', (error) => errors.push(error.message));
        await mockGist(page, {
            status,
        });
        
        await page.goto('/#/gist/abc/rev1');
        await expect.poll(() => errors.length).toBeGreaterThan(0);
        
        await expect(page.locator('.cm-content').first()).toHaveText('');
    });
}

test('gist: an invalid source shows the AST alert and an empty AST panel', async ({page}) => {
    await mockGist(page, {
        body: {
            ...gist,
            files: {
                ...gist.files,
                'source.js': {
                    content: 'const = ;',
                },
            },
        },
    });
    
    await page.goto('/#/gist/abc/rev1');
    await page.getByRole('tab', {name: 'AST'}).click();
    
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.locator('.cm-content')).toHaveText('');
});
