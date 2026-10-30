import {setTimeout} from 'node:timers/promises';
import {test} from 'supertape';
import {render, cleanup, waitFor} from '@testing-library/react';
import {EditorView} from '@codemirror/view';
import {Transform} from './Transform.js';
import DefaultTransform from './DefaultTransform.js';
import {withAsyncSelectionChange} from '../../test/dom.js';

const noop = () => {};

const mount = ({gistReady = true, isVim = false} = {}) => {
    const calls = {
        transform: [],
        code: [],
        ready: [],
    };
    
    const view = render(<Transform
        isVim={isVim}
        gistReady={gistReady}
        source="a ? b : c;"
        transform={DefaultTransform}
        setSource={noop}
        setInfo={noop}
        setError={noop}
        setFinalTransform={noop}
        setCode={(a) => calls.code.push(a)}
        setTransform={(a) => calls.transform.push(a)}
        setResultReady={(a) => calls.ready.push(a)}
    />);
    
    return {
        ...view,
        calls,
    };
};

const until = (fn) => waitFor(() => {
    if (!fn())
        throw Error('not yet');
});

test('transform: gistReady false: the editor is empty', (t) => {
    const {container} = mount({
        gistReady: false,
    });
    
    const result = container.querySelector('.cm-content').textContent;
    const expected = '';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('transform: gistReady false: does not run the transform', async (t) => {
    const {calls} = mount({
        gistReady: false,
    });
    
    await setTimeout(300);
    cleanup();
    
    const result = calls.code;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('transform: gistReady true: the editor shows the transform', (t) => {
    const {container} = mount();
    
    const result = container.querySelector('.cm-content').textContent.includes('export const report');
    
    cleanup();
    t.ok(result);
    t.end();
});

test('transform: gistReady true: runs the transform on mount', async (t) => {
    const {calls} = mount();
    
    await until(() => calls.transform.length);
    cleanup();
    
    const [result] = calls.transform;
    const expected = DefaultTransform;
    
    t.equal(result, expected);
    t.end();
});

test('transform: gistReady true: sets the transformed code on mount', async (t) => {
    const {calls} = mount();
    
    await until(() => calls.code.length);
    cleanup();
    
    const [result] = calls.code;
    const expected = 'if (a)\n    b;\nelse\n    c;\n';
    
    t.equal(result, expected);
    t.end();
});

test('transform: editing runs the transform with the typed value', async (t) => {
    const {container, calls} = mount();
    
    await until(() => calls.transform.length);
    
    const view = EditorView.findFromDOM(container.querySelector('.cm-editor'));
    
    withAsyncSelectionChange(() => {
        view.dispatch({
            changes: {
                from: view.state.doc.length,
                insert: '\nconst a = 1;',
            },
        });
    });
    
    await until(() => calls.transform.length > 1);
    cleanup();
    
    const result = calls.transform.at(-1);
    const expected = `${DefaultTransform}\nconst a = 1;`;
    
    t.equal(result, expected);
    t.end();
});

test('transform: isVim keeps the transform text', (t) => {
    const {container} = mount({
        isVim: true,
    });
    
    const result = container.querySelector('.cm-content').textContent.includes('export const report');
    
    cleanup();
    t.ok(result);
    t.end();
});
