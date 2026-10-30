import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import {test as base, expect} from '@playwright/test';

export {expect};

export const test = base.extend({
    page: async ({page}, use) => {
        const requests = [];
        
        await page.route('https://esm.sh/**', (route) => {
            requests.push(route.request().url());
            route.abort();
        });
        
        page.esmRequests = requests;
        
        await use(page);
        
        if (!process.env.E2E_COVERAGE)
            return;
        
        const coverage = await page.evaluate(() => globalThis.__coverage__);
        
        if (!coverage)
            return;
        
        await mkdir('.nyc_output', {recursive: true});
        await writeFile(`.nyc_output/${randomUUID()}.json`, JSON.stringify(coverage));
    },
});
