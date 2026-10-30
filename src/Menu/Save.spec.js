import {test} from 'supertape';
import {render, cleanup} from '@testing-library/react';
import {tryToCatch} from 'try-to-catch';
import {createSave} from './Save.js';
import {stubFetch} from '../../test/fetch.js';

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
    },
};

const respond = ({ok = true} = {}) => Promise.resolve({
    ok,
    json: async () => gist,
});

const save = async ({ok = true} = {}) => {
    const events = [];
    const successes = [];
    const requests = [];
    
    const restore = stubFetch((url, options) => {
        events.push('fetch');
        requests.push({
            url,
            options,
        });
        
        return respond({
            ok,
        });
    });
    
    const run = createSave({
        close: () => events.push('close'),
        source: 'const a = 1;',
        transform: 'export const report = () => "x";',
        setSuccess: (a) => successes.push(a),
    });
    
    const hashBefore = globalThis.location.hash;
    const [error] = await tryToCatch(run);
    const hash = globalThis.location.hash;
    
    globalThis.location.hash = hashBefore;
    restore();
    
    return {
        error,
        events,
        successes,
        requests,
        hash,
    };
};

test('save: closes the menu before the request', async (t) => {
    const {events} = await save();
    
    const result = events;
    const expected = ['close', 'fetch'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('save: POSTs the source and the transform', async (t) => {
    const {requests} = await save();
    const [{options}] = requests;
    const {code, transform, filename} = JSON.parse(options.body);
    
    const result = {
        code,
        transform,
        filename,
    };
    
    const expected = {
        code: 'const a = 1;',
        transform: 'export const report = () => "x";',
        filename: 'source.js',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('save: POSTs the default settings', async (t) => {
    const {requests} = await save();
    const [{options}] = requests;
    const {v, parserID, toolID} = JSON.parse(options.body);
    
    const result = {
        v,
        parserID,
        toolID,
    };
    
    const expected = {
        v: 2,
        parserID: 'babel',
        toolID: 'putout',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('save: sets the location hash to the path of the revision', async (t) => {
    const {hash} = await save();
    
    const result = hash;
    const expected = '#/gist/abc/rev1';
    
    t.equal(result, expected);
    t.end();
});

test('save: setSuccess gets a link to the editor', async (t) => {
    const {successes} = await save();
    const [element] = successes;
    const {container} = render(element);
    
    const result = container.querySelector('a').getAttribute('href');
    const expected = 'https://putout.cloudcmd.io/#/gist/abc/rev1';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('save: failed create rejects with the message', async (t) => {
    const {error} = await save({
        ok: false,
    });
    
    const result = error.message;
    const expected = 'Unable to create snippet.';
    
    t.equal(result, expected);
    t.end();
});

test('save: failed create does not call setSuccess', async (t) => {
    const {successes} = await save({
        ok: false,
    });
    
    const result = successes;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});
