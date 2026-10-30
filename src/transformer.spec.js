import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {
    parseSource,
    createTransform,
    createTransformRunner,
} from './transformer.js';
import {loadBundle} from './putout-loader.js';

const transformCode = `export const report = () => 'x';
export const replace = () => ({'__a ? __b : __c': 'if (__a) __b; else __c;'});`;

const spies = () => {
    const calls = {
        info: [],
        error: [],
        final: [],
        code: [],
        transform: [],
        source: [],
        ready: [],
    };
    
    return {
        calls,
        options: {
            setInfo: (a) => calls.info.push(a),
            setError: (a) => calls.error.push(a),
            setFinalTransform: (a) => calls.final.push(a),
            setCode: (a) => calls.code.push(a),
            setTransform: (a) => calls.transform.push(a),
            setSource: (a) => calls.source.push(a),
            setResultReady: (a) => calls.ready.push(a),
        },
    };
};

const transform = async (value, type = 'transform') => {
    const {putout} = await loadBundle();
    const {calls, options} = spies();
    
    await createTransform({
        type,
        value,
        putout,
        ...options,
    });
    
    return calls;
};

test('transformer: parseSource: Program of a declaration', async (t) => {
    const {type} = JSON.parse(await parseSource('const a = 1;'));
    const result = type;
    const expected = 'Program';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: parseSource: strips positions', async (t) => {
    const source = await parseSource('const a = 1;');
    
    const result = /"(start|end|loc)"/.test(source);
    const expected = false;
    
    t.equal(result, expected);
    t.end();
});

test('transformer: parseSource: strips leadingComments, directives and interpreter', async (t) => {
    const source = await parseSource('#!/usr/bin/env node\n"use strict";\n// hi\nconst a = 1;');
    
    const result = /"(leadingComments|directives|interpreter)"/.test(source);
    const expected = false;
    
    t.equal(result, expected);
    t.end();
});

test('transformer: parseSource: invalid source rejects', async (t) => {
    const [error] = await tryToCatch(parseSource, 'const = ;');
    
    t.ok(error);
    t.end();
});

test('transformer: createTransform: returns the exports of the transform', async (t) => {
    const {putout} = await loadBundle();
    const {options} = spies();
    
    const exports = await createTransform({
        type: 'transform',
        value: transformCode,
        putout,
        ...options,
    });
    
    const result = Object.keys(exports);
    const expected = ['report', 'replace'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransform: no places: no error', async (t) => {
    const {error} = await transform(transformCode);
    
    const result = error;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransform: places: setError with the first message', async (t) => {
    const {error} = await transform(`export const replace = () => ({'__a ? __b': 'if (__a) __b'});`);
    
    const result = error;
    const expected = ['Unexpected token, expected ":" (1:9)'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransform: type transform: setFinalTransform gets the code', async (t) => {
    const {final} = await transform(transformCode);
    
    const result = final.length;
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: other type: no setFinalTransform', async (t) => {
    const {final} = await transform(transformCode, 'source');
    
    const result = final;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransform: setInfo is cleared before the transform runs', async (t) => {
    const {info} = await transform(transformCode);
    
    const result = info;
    const expected = [''];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransform: console.log of a string', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log('hi');`);
    
    const result = info.at(-1);
    const expected = '"hi"';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: console.log of a function', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log(function hello() {});`);
    
    const result = info.at(-1);
    const expected = 'function hello() {}';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: console.log of an object with node', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log({node: 1});`);
    
    const result = info.at(-1);
    const expected = '[object Object]';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: console.log of a plain object', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log({a: 1});`);
    
    const result = info.at(-1);
    const expected = '{"a":1}';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: console.log of null', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log(null);`);
    
    const result = info.at(-1);
    const expected = 'null';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: require("path") is the path shim', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log(require('path').sep);`);
    
    const result = info.at(-1);
    const expected = '"/"';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: require("node:path") is the path shim', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log(require('node:path').sep);`);
    
    const result = info.at(-1);
    const expected = '"/"';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: any other require is putout', async (t) => {
    const {info} = await transform(`${transformCode}\nconsole.log(typeof require('putout'));`);
    
    const result = info.at(-1);
    const expected = '"function"';
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransform: a throwing transform rejects', async (t) => {
    const {putout} = await loadBundle();
    const {options} = spies();
    
    const [error] = await tryToCatch(createTransform, {
        type: 'transform',
        value: `${transformCode}\nthrow Error('boom');`,
        putout,
        ...options,
    });
    
    const result = error.message;
    const expected = 'boom';
    
    t.equal(result, expected);
    t.end();
});

const run = async ({type = 'transform', value = transformCode, source = 'a ? b : c;', withReady = true} = {}) => {
    const {calls, options} = spies();
    
    if (!withReady)
        delete options.setResultReady;
    
    await createTransformRunner(type)(value, {
        source,
        ...options,
    });
    
    return calls;
};

test('transformer: createTransformRunner: transform: setCode gets the transformed source', async (t) => {
    const {code} = await run();
    
    const result = code;
    const expected = ['if (a)\n    b;\nelse\n    c;\n'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: transform: setTransform gets the value', async (t) => {
    const {transform} = await run();
    
    const result = transform;
    const expected = [transformCode];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: transform: result is ready', async (t) => {
    const {ready} = await run();
    
    const result = ready;
    const expected = [true];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: transform: no setSource', async (t) => {
    const {source} = await run();
    
    const result = source;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: source: setSource gets the source', async (t) => {
    const {source} = await run({
        type: 'source',
    });
    
    const result = source;
    const expected = ['a ? b : c;'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: source: no setTransform', async (t) => {
    const {transform} = await run({
        type: 'source',
    });
    
    const result = transform;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: unknown type sets code only', async (t) => {
    const {code, source, transform} = await run({
        type: 'other',
    });
    
    const result = [
        code.length,
        source.length,
        transform.length,
    ];
    
    const expected = [1, 0, 0];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: setResultReady is optional', async (t) => {
    const {code} = await run({
        withReady: false,
    });
    
    const result = code.length;
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('transformer: createTransformRunner: flatlint fixes a broken transform', async (t) => {
    const {transform} = await run({
        value: `${transformCode}\nconst a = [1, 2;`,
    });
    
    const result = transform;
    const expected = [`${transformCode}\nconst a = [1, 2];`];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: a transform flatlint cannot fix: setError with the error', async (t) => {
    const {error} = await run({
        value: `${transformCode}\nconst a = {`,
    });
    
    const [result] = error;
    
    t.ok(result instanceof Error);
    t.end();
});

test('transformer: createTransformRunner: a transform flatlint cannot fix: no setCode', async (t) => {
    const {code} = await run({
        value: `${transformCode}\nconst a = {`,
    });
    
    const result = code;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: putout error: setError with the error', async (t) => {
    const {error} = await run({
        source: 'const = ;',
    });
    
    const [result] = error.filter(Boolean);
    
    t.ok(result instanceof Error);
    t.end();
});

test('transformer: createTransformRunner: putout error: no setCode', async (t) => {
    const {code} = await run({
        source: 'const = ;',
    });
    
    const result = code;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transformer: createTransformRunner: success clears the error', async (t) => {
    const {error} = await run();
    
    const result = error.at(-1);
    const expected = null;
    
    t.equal(result, expected);
    t.end();
});
