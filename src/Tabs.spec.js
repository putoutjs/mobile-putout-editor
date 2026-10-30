import {test} from 'supertape';
import {render, cleanup, fireEvent} from '@testing-library/react';
import MainTabs from './Tabs.js';
import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';

const noop = () => {};

const mount = (props = {}) => render(<MainTabs
    isVim={false}
    gistReady={true}
    source={DefaultSource}
    transform={DefaultTransform}
    setSource={noop}
    setTransform={noop}
    setError={noop}
    setInfo={noop}
    {...props}
/>);

const editors = (container) => container.querySelectorAll('.cm-content');

test('tabs: four tab labels in order', (t) => {
    const {getAllByRole} = mount();
    
    const result = getAllByRole('tab').map((tab) => tab.textContent);
    const expected = [
        'Transform',
        'Source',
        'AST',
        'Cooked',
    ];
    
    cleanup();
    t.deepEqual(result, expected);
    t.end();
});

test('tabs: Transform is selected on load', (t) => {
    const {getByRole} = mount();
    
    const result = getByRole('tab', {
        name: 'Transform',
    }).getAttribute('aria-selected');
    
    const expected = 'true';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: Transform panel has one editor with the transform', (t) => {
    const {container} = mount();
    
    const [editor] = editors(container);
    
    const result = [
        editors(container).length,
        editor.textContent.includes('export const report'),
    ];
    
    const expected = [1, true];
    
    cleanup();
    t.deepEqual(result, expected);
    t.end();
});

test('tabs: clicking Source selects it', (t) => {
    const {getByRole} = mount();
    const tab = getByRole('tab', {
        name: 'Source',
    });
    
    fireEvent.click(tab);
    
    const result = tab.getAttribute('aria-selected');
    const expected = 'true';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: Source tab renders two editors: source and result', (t) => {
    const {container, getByRole} = mount();
    
    fireEvent.click(getByRole('tab', {
        name: 'Source',
    }));
    
    const result = editors(container).length;
    const expected = 2;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: clicking AST shows one editor', (t) => {
    const {container, getByRole} = mount();
    
    fireEvent.click(getByRole('tab', {
        name: 'AST',
    }));
    
    const result = editors(container).length;
    const expected = 1;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: clicking Cooked shows the final transform', (t) => {
    const {container, getByRole} = mount();
    
    fireEvent.click(getByRole('tab', {
        name: 'Cooked',
    }));
    
    const [editor] = editors(container);
    const result = editor.textContent.includes('export const report');
    
    cleanup();
    t.ok(result);
    t.end();
});

test('tabs: no alert without error, info and success', (t) => {
    const {queryAllByRole} = mount();
    
    const result = queryAllByRole('alert').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: error renders an error alert with its text', (t) => {
    const {getByRole} = mount({
        error: Error('boom'),
    });
    
    const result = getByRole('alert').textContent;
    const expected = 'Error: boom';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: info renders an alert with its text', (t) => {
    const {getByRole} = mount({
        info: 'hello',
    });
    
    const result = getByRole('alert').textContent;
    const expected = 'hello';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('tabs: success renders an alert with its content', (t) => {
    const {getByRole} = mount({
        success: <span>saved</span>,
    });
    
    const result = getByRole('alert').textContent;
    const expected = 'saved';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});
