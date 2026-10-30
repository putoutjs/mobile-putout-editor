import {test} from 'supertape';
import {render, cleanup, waitFor} from '@testing-library/react';
import {AST} from './AST.js';

const text = (container) => container.querySelector('.cm-content').textContent;
const noop = () => {};

test('ast: shows the seatbelt text before the first parse finishes', (t) => {
    const {container} = render(<AST isVim={false} source="const a = 1;" setError={noop}/>);
    
    const result = text(container);
    const expected = 'Fasten your seatbelts... 🚀';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('ast: valid source shows the Program as JSON', async (t) => {
    const {container} = render(<AST isVim={false} source="const a = 1;" setError={noop}/>);
    
    await waitFor(() => {
        if (!text(container).includes('"type"'))
            throw Error('not parsed yet');
    });
    
    const result = text(container).includes('"type": "Program"');
    
    cleanup();
    t.ok(result);
    t.end();
});

test('ast: valid source does not call setError', async (t) => {
    const errors = [];
    const {container} = render(<AST isVim={false} source="const a = 1;" setError={(a) => errors.push(a)}/>);
    
    await waitFor(() => {
        if (!text(container).includes('"type"'))
            throw Error('not parsed yet');
    });
    
    cleanup();
    
    const result = errors;
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('ast: invalid source calls setError with the message', async (t) => {
    const errors = [];
    const {container} = render(<AST isVim={false} source="const = ;" setError={(a) => errors.push(a)}/>);
    
    await waitFor(() => {
        if (!errors.length)
            throw Error('no error yet');
    });
    
    cleanup();
    
    const result = errors[0];
    const expected = 'Unexpected token (1:6)';
    
    t.equal(result, expected);
    t.end();
});

test('ast: invalid source leaves an empty editor', async (t) => {
    const errors = [];
    const {container} = render(<AST isVim={false} source="const = ;" setError={(a) => errors.push(a)}/>);
    
    await waitFor(() => {
        if (!errors.length)
            throw Error('no error yet');
    });
    
    const result = text(container);
    const expected = '';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('ast: isVim keeps the parsed JSON', async (t) => {
    const {container} = render(<AST isVim={true} source="const a = 1;" setError={noop}/>);
    
    await waitFor(() => {
        if (!text(container).includes('"type"'))
            throw Error('not parsed yet');
    });
    
    const result = text(container).includes('"type": "Program"');
    
    cleanup();
    t.ok(result);
    t.end();
});
