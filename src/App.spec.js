import {test} from 'supertape';
import {render, cleanup, waitFor} from '@testing-library/react';
import {stubFetch} from '../test/fetch.js';

// App runs `run` once per module instance: a query ending with .js gives a fresh one
const importApp = async (name) => {
    const {default: App} = await import(`./App.js?${name}=.js`);
    
    return App;
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
            }),
        },
        'source.js': {
            content: 'const fromGist = 1;',
        },
        'transform.js': {
            content: 'export const report = () => "from gist";',
        },
    },
};

const withHash = async (hash, fn) => {
    const original = globalThis.location.hash;
    
    globalThis.location.hash = hash;
    
    await fn();
    
    globalThis.location.hash = original;
};

const keydown = (key) => globalThis.dispatchEvent(new KeyboardEvent('keydown', {
    key,
}));

const trackKeydownListeners = () => {
    const added = [];
    const removed = [];
    const {addEventListener, removeEventListener} = globalThis;
    
    globalThis.addEventListener = function(type, handler, ...args) {
        if (type === 'keydown')
            added.push(handler);
        
        return addEventListener.call(this, type, handler, ...args);
    };
    
    globalThis.removeEventListener = function(type, handler, ...args) {
        if (type === 'keydown')
            removed.push(handler);
        
        return removeEventListener.call(this, type, handler, ...args);
    };
    
    return {
        added,
        removed,
        restore: () => {
            globalThis.addEventListener = addEventListener;
            globalThis.removeEventListener = removeEventListener;
        },
    };
};

test('app: no hash: does not fetch a gist', async (t) => {
    const App = await importApp('no-hash');
    const urls = [];
    const restore = stubFetch((url) => urls.push(url));
    
    render(<App/>);
    
    restore();
    cleanup();
    
    const result = urls;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('app: no hash: no progress bar', async (t) => {
    const App = await importApp('no-hash-bar');
    const {queryAllByRole} = render(<App/>);
    
    const result = queryAllByRole('progressbar').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('app: no hash: the Transform editor shows the default transform', async (t) => {
    const App = await importApp('no-hash-editor');
    const {container} = render(<App/>);
    
    const result = container.querySelector('.cm-content').textContent.includes('export const report');
    
    cleanup();
    t.ok(result);
    t.end();
});

test('app: hash: progress bar is visible until the gist is ready', async (t) => {
    const App = await importApp('hash-bar');
    let resolve;
    
    const restore = stubFetch(() => new Promise((done) => {
        resolve = done;
    }));
    
    const results = [];
    
    await withHash('#/gist/abc', async () => {
        const {queryAllByRole} = render(<App/>);
        
        results.push(queryAllByRole('progressbar').length);
        
        resolve({
            ok: true,
            json: async () => gist,
        });
        
        await waitFor(() => {
            if (queryAllByRole('progressbar').length)
                throw Error('still loading');
        });
        
        results.push(queryAllByRole('progressbar').length);
    });
    
    restore();
    cleanup();
    
    const expected = [1, 0];
    
    t.deepEqual(results, expected);
    t.end();
});

test('app: hash: the gist fills the Transform editor', async (t) => {
    const App = await importApp('hash-content');
    const restore = stubFetch(() => Promise.resolve({
        ok: true,
        json: async () => gist,
    }));
    
    let result;
    
    await withHash('#/gist/abc', async () => {
        const {container} = render(<App/>);
        
        await waitFor(() => {
            if (!container.querySelector('.cm-content').textContent.includes('from gist'))
                throw Error('not filled yet');
        });
        
        result = container.querySelector('.cm-content').textContent;
    });
    
    restore();
    cleanup();
    
    const expected = 'export const report = () => "from gist";';
    
    t.equal(result, expected);
    t.end();
});

test('app: hash: requests the latest revision of the gist', async (t) => {
    const App = await importApp('hash-url');
    const urls = [];
    
    const restore = stubFetch((url) => {
        urls.push(url);
        
        return Promise.resolve({
            ok: true,
            json: async () => gist,
        });
    });
    
    await withHash('#/gist/abc', async () => {
        const {container} = render(<App/>);
        
        await waitFor(() => {
            if (!urls.length)
                throw Error('not requested yet');
        });
    });
    
    restore();
    cleanup();
    
    const result = urls;
    const expected = ['https://putout.cloudcmd.io/api/v1/gist/abc/latest'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('app: the first Escape removes its keydown listener', async (t) => {
    const App = await importApp('escape-remove');
    const tracker = trackKeydownListeners();
    
    render(<App/>);
    
    keydown('Escape');
    
    tracker.restore();
    cleanup();
    
    const [handler] = tracker.added;
    const result = tracker.removed.filter((a) => a === handler).length;
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('app: the second Escape does not remove the listener again', async (t) => {
    const App = await importApp('escape-twice');
    const tracker = trackKeydownListeners();
    
    render(<App/>);
    
    keydown('Escape');
    keydown('Escape');
    
    tracker.restore();
    cleanup();
    
    const [handler] = tracker.added;
    const result = tracker.removed.filter((a) => a === handler).length;
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('app: another key keeps the listener', async (t) => {
    const App = await importApp('other-key');
    const tracker = trackKeydownListeners();
    
    render(<App/>);
    
    keydown('a');
    
    tracker.restore();
    cleanup();
    
    const [handler] = tracker.added;
    const result = tracker.removed.filter((a) => a === handler).length;
    const expected = 0;
    
    t.equal(result, expected);
    t.end();
});

test('app: Escape switches the editor to vim', async (t) => {
    const App = await importApp('escape-vim');
    const {container} = render(<App/>);
    const before = container.querySelector('.cm-editor').classList.length;
    
    keydown('Escape');
    
    await waitFor(() => {
        if (container.querySelector('.cm-editor').classList.length === before)
            throw Error('not vim yet');
    });
    
    const after = container.querySelector('.cm-editor').classList.length;
    
    cleanup();
    
    const result = after > before;
    
    t.ok(result);
    t.end();
});
