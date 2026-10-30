import {setTimeout} from 'node:timers/promises';
import {test} from 'supertape';
import {render, cleanup} from '@testing-library/react';
import {EditorView} from '@codemirror/view';
import {Source} from './Source.js';
import DefaultTransform from '../Transform/DefaultTransform.js';
import {withAsyncSelectionChange} from '../../test/dom.js';

const noop = () => {};

const edit = async ({isVim = false} = {}) => {
    const calls = {
        source: [],
        code: [],
    };
    
    const {container} = render(<Source
        isVim={isVim}
        source="const a = 1;"
        transform={DefaultTransform}
        setSource={(value) => calls.source.push(value)}
        setCode={(value) => calls.code.push(value)}
        setInfo={noop}
        setTransform={noop}
        setError={noop}
        setFinalTransform={noop}
        setResultReady={noop}
    />);
    
    const view = EditorView.findFromDOM(container.querySelector('.cm-editor'));
    
    withAsyncSelectionChange(() => {
        view.dispatch({
            changes: {
                from: view.state.doc.length,
                insert: '\nconst b = 2;',
            },
        });
    });
    
    for (let i = 0; i < 100 && !calls.source.length; i++)
        await setTimeout(100);
    
    cleanup();
    
    return calls;
};

test('source: editing the editor runs the transform and calls setSource with the typed value', async (t) => {
    const {source} = await edit();
    
    const result = source;
    const expected = ['const a = 1;\nconst b = 2;'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('source: editing the editor calls setCode with the transformed source', async (t) => {
    const {code} = await edit();
    
    const result = code.length;
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('source: isVim: editing still calls setSource', async (t) => {
    const {source} = await edit({
        isVim: true,
    });
    
    const result = source;
    const expected = ['const a = 1;\nconst b = 2;'];
    
    t.deepEqual(result, expected);
    t.end();
});
