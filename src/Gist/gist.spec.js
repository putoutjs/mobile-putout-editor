import {test} from 'supertape';
import {render, cleanup, fireEvent} from '@testing-library/react';
import {tryToCatch} from 'try-to-catch';
import {
    owns,
    matchesURL,
    fetchFromURL,
    create,
    update,
    fork,
} from './gist.js';
import {stubFetch} from '../../test/fetch.js';

const makeGist = ({v = 2, toolID = 'putout', transform = true, id = 'abc', version = 'rev1'} = {}) => {
    const files = {
        'astexplorer.json': {
            content: JSON.stringify({
                v,
                toolID,
            }),
        },
        'code.js': {
            content: 'const v1 = 1;',
        },
        'source.js': {
            content: 'const v2 = 2;',
        },
    };
    
    if (transform)
        files['transform.js'] = {
            content: 'export const report = () => "x";',
        };
    
    return {
        id,
        history: [{
            version,
        }],
        files,
    };
};

const respond = (body, {ok = true, status = 200} = {}) => Promise.resolve({
    ok,
    status,
    json: async () => body,
});

const withHash = (hash, fn) => async () => {
    const original = globalThis.location.hash;
    
    globalThis.location.hash = hash;
    
    const result = await fn();
    
    globalThis.location.hash = original;
    
    return result;
};

const record = (handler) => {
    const calls = [];
    const restore = stubFetch((url, options) => {
        calls.push({
            url,
            options,
        });
        
        return handler(url, options);
    });
    
    return {
        calls,
        restore,
    };
};

test('gist: matchesURL: hash with a gist id', async (t) => {
    const result = await withHash('#/gist/abc/rev1', () => matchesURL())();
    const expected = true;
    
    t.equal(result, expected);
    t.end();
});

test('gist: matchesURL: hash without a gist id', async (t) => {
    const result = await withHash('#/other', () => matchesURL())();
    const expected = false;
    
    t.equal(result, expected);
    t.end();
});

test('gist: fetchFromURL: no match resolves null', async (t) => {
    const result = await withHash('#/other', () => fetchFromURL())();
    const expected = null;
    
    t.equal(result, expected);
    t.end();
});

test('gist: fetchFromURL: requests the latest revision of the snippet', async (t) => {
    const {calls, restore} = record(() => respond(makeGist()));
    
    await withHash('#/gist/abc/rev1', () => fetchFromURL())();
    restore();
    
    const [{url}] = calls;
    const expected = 'https://putout.cloudcmd.io/api/v1/gist/abc/latest';
    
    t.equal(url, expected);
    t.end();
});

test('gist: fetchFromURL: resolves a revision with the snippet path', async (t) => {
    const {restore} = record(() => respond(makeGist()));
    
    const revision = await withHash('#/gist/abc', () => fetchFromURL())();
    
    restore();
    
    const result = revision.getPath();
    const expected = '/gist/abc/rev1';
    
    t.equal(result, expected);
    t.end();
});

test('gist: fetchFromURL: 404 has a message with the snippet id', async (t) => {
    const {restore} = record(() => respond({}, {
        ok: false,
        status: 404,
    }));
    
    const [error] = await tryToCatch(withHash('#/gist/abc', () => fetchFromURL()));
    
    restore();
    
    const result = error.message;
    const expected = `Snippet with ID abc/latest doesn't exist.`;
    
    t.equal(result, expected);
    t.end();
});

test('gist: fetchFromURL: other status is an unknown error', async (t) => {
    const {restore} = record(() => respond({}, {
        ok: false,
        status: 500,
    }));
    
    const [error] = await tryToCatch(withHash('#/gist/abc', () => fetchFromURL()));
    
    restore();
    
    const result = error.message;
    const expected = 'Unknown error.';
    
    t.equal(result, expected);
    t.end();
});

test('gist: create: POSTs the data as JSON', async (t) => {
    const {calls, restore} = record(() => respond(makeGist()));
    
    await create({a: 1});
    restore();
    
    const [{options}] = calls;
    
    const result = [
        options.method,
        options.headers['Content-Type'],
        options.body,
    ];
    
    const expected = [
        'POST',
        'application/json',
        '{"a":1}',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: create: resolves a revision', async (t) => {
    const {restore} = record(() => respond(makeGist()));
    
    const revision = await create({});
    
    restore();
    
    const result = owns(revision);
    
    t.ok(result);
    t.end();
});

test('gist: create: failure message', async (t) => {
    const {restore} = record(() => respond({}, {
        ok: false,
        status: 500,
    }));
    
    const [error] = await tryToCatch(create, {});
    
    restore();
    
    const result = error.message;
    const expected = 'Unable to create snippet.';
    
    t.equal(result, expected);
    t.end();
});

test('gist: owns: a plain object is not a revision', (t) => {
    const result = owns({});
    const expected = false;
    
    t.equal(result, expected);
    t.end();
});

test('gist: update: PATCHes the snippet without clearing the transform when the latest revision has no tool', async (t) => {
    const latest = makeGist({
        toolID: '',
    });
    
    const {calls, restore} = record((url, options) => {
        if (options.method === 'GET')
            return respond(latest);
        
        return respond(makeGist());
    });
    
    const revision = await create({});
    const data = {
        toolID: '',
    };
    
    calls.length = 0;
    
    await update(revision, data);
    restore();
    
    const result = JSON.parse(calls[1].options.body);
    const expected = {
        toolID: '',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: update: removes the transform when the latest revision has a tool and the update has none', async (t) => {
    const {calls, restore} = record((url, options) => {
        return respond(makeGist());
    });
    
    const revision = await create({});
    
    calls.length = 0;
    
    await update(revision, {});
    restore();
    
    const result = JSON.parse(calls[1].options.body);
    const expected = {
        transform: null,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: update: keeps the transform when the update has a tool', async (t) => {
    const {calls, restore} = record(() => respond(makeGist()));
    
    const revision = await create({});
    
    calls.length = 0;
    
    await update(revision, {
        toolID: 'putout',
    });
    
    restore();
    
    const result = JSON.parse(calls[1].options.body);
    const expected = {
        toolID: 'putout',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: update: PATCH url', async (t) => {
    const {calls, restore} = record(() => respond(makeGist()));
    
    const revision = await create({});
    
    calls.length = 0;
    
    await update(revision, {});
    restore();
    
    const result = [
        calls[1].url,
        calls[1].options.method,
    ];
    
    const expected = [
        'https://putout.cloudcmd.io/api/v1/gist/abc',
        'PATCH',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: update: failure message', async (t) => {
    let count = 0;
    
    const {restore} = record(() => {
        count++;
        
        if (count < 3)
            return respond(makeGist());
        
        return respond({}, {
            ok: false,
            status: 500,
        });
    });
    
    const revision = await create({});
    const [error] = await tryToCatch(update, revision, {});
    
    restore();
    
    const result = error.message;
    const expected = 'Unable to update snippet.';
    
    t.equal(result, expected);
    t.end();
});

test('gist: fork: POSTs to the snippet and revision', async (t) => {
    const {calls, restore} = record(() => respond(makeGist()));
    
    const revision = await create({});
    
    calls.length = 0;
    
    await fork(revision, {});
    restore();
    
    const [{url, options}] = calls;
    
    const result = [
        url,
        options.method,
    ];
    
    const expected = [
        'https://putout.cloudcmd.io/api/v1/gist/abc/rev1',
        'POST',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: fork: resolves a revision', async (t) => {
    const {restore} = record(() => respond(makeGist()));
    
    const revision = await create({});
    const forked = await fork(revision, {});
    
    restore();
    
    const result = owns(forked);
    
    t.ok(result);
    t.end();
});

test('gist: fork: failure message', async (t) => {
    let count = 0;
    
    const {restore} = record(() => {
        count++;
        
        if (count < 2)
            return respond(makeGist());
        
        return respond({}, {
            ok: false,
            status: 500,
        });
    });
    
    const revision = await create({});
    const [error] = await tryToCatch(fork, revision, {});
    
    restore();
    
    const result = error.message;
    const expected = 'Unable to fork snippet.';
    
    t.equal(result, expected);
    t.end();
});

const createRevision = async (gist) => {
    const restore = stubFetch(() => respond(gist));
    const revision = await create({});
    
    restore();
    
    return revision;
};

test('gist: Revision: canSave', async (t) => {
    const revision = await createRevision(makeGist());
    
    const result = revision.canSave();
    
    t.ok(result);
    t.end();
});

test('gist: Revision: getSnippetID', async (t) => {
    const revision = await createRevision(makeGist());
    
    const result = revision.getSnippetID();
    const expected = 'abc';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getRevisionID', async (t) => {
    const revision = await createRevision(makeGist());
    
    const result = revision.getRevisionID();
    const expected = 'rev1';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getTransformerID', async (t) => {
    const revision = await createRevision(makeGist());
    
    const result = revision.getTransformerID();
    const expected = 'putout';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getTransformCode with transform.js', async (t) => {
    const revision = await createRevision(makeGist());
    
    const result = revision.getTransformCode();
    const expected = 'export const report = () => "x";';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getTransformCode without transform.js', async (t) => {
    const revision = await createRevision(makeGist({
        transform: false,
    }));
    
    const result = revision.getTransformCode();
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getCode v1 reads code.js', async (t) => {
    const revision = await createRevision(makeGist({
        v: 1,
    }));
    
    const result = revision.getCode();
    const expected = 'const v1 = 1;';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getCode v2 reads source.js', async (t) => {
    const revision = await createRevision(makeGist({
        v: 2,
    }));
    
    const result = revision.getCode();
    const expected = 'const v2 = 2;';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getCode of an unknown version is empty', async (t) => {
    const revision = await createRevision(makeGist({
        v: 3,
    }));
    
    const result = revision.getCode();
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getCode is cached', async (t) => {
    const gist = makeGist();
    const revision = await createRevision(gist);
    
    revision.getCode();
    gist.files['source.js'].content = 'changed';
    
    const result = revision.getCode();
    const expected = 'const v2 = 2;';
    
    t.equal(result, expected);
    t.end();
});

test('gist: Revision: getShareInfo: three links', async (t) => {
    const revision = await createRevision(makeGist());
    const {container} = render(revision.getShareInfo());
    
    const result = [...container.querySelectorAll('input')].map((input) => input.value);
    
    cleanup();
    
    const expected = [
        'https://putout.cloudcmd.io/#/gist/abc/rev1',
        'https://putout.cloudcmd.io//#/gist/abc/latest',
        'https://gist.github.com/abc/rev1',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('gist: Revision: getShareInfo: focus selects the text of every input', async (t) => {
    const revision = await createRevision(makeGist());
    const {container} = render(revision.getShareInfo());
    const inputs = [...container.querySelectorAll('input')];
    const selected = [];
    
    inputs.forEach((input, i) => {
        input.select = () => {
            selected.push(i);
        };
        
        fireEvent.focus(input);
    });
    
    cleanup();
    
    const result = selected;
    const expected = [0, 1, 2];
    
    t.deepEqual(result, expected);
    t.end();
});
