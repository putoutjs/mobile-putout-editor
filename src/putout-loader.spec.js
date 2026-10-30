import {test} from 'supertape';
import {
    loadBundle,
    loadFlatlint,
    loadPlugins,
} from './putout-loader.js';

test('putout-loader: loadBundle: parse, traverse and putout are functions', async (t) => {
    const {parse, traverse, putout} = await loadBundle();
    
    const result = [
        typeof parse,
        typeof traverse,
        typeof putout,
    ];
    
    const expected = [
        'function',
        'function',
        'function',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout-loader: loadFlatlint: lint is a function and plugins is an array', async (t) => {
    const {lint, plugins} = await loadFlatlint();
    
    const result = [
        typeof lint,
        Array.isArray(plugins),
    ];
    
    const expected = [
        'function',
        true,
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout-loader: loadPlugins: ten plugin modules', async (t) => {
    const plugins = await loadPlugins();
    
    const result = plugins.length;
    const expected = 10;
    
    t.equal(result, expected);
    t.end();
});
