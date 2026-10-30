import {test} from 'supertape';
import {render, cleanup} from '@testing-library/react';
import {Result} from './Result.js';

test('result: shows the code', (t) => {
    const {container} = render(<Result isVim={false} code="const a = 1;" resultReady={true}/>);
    
    const result = container.querySelector('.cm-content').textContent;
    const expected = 'const a = 1;';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('result: resultReady false shows the progress bar', (t) => {
    const {container} = render(<Result isVim={false} code="" resultReady={false}/>);
    
    const result = container.querySelectorAll('[role="progressbar"]').length;
    const expected = 1;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('result: resultReady true hides the progress bar', (t) => {
    const {container} = render(<Result isVim={false} code="" resultReady={true}/>);
    
    const result = container.querySelectorAll('[role="progressbar"]').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('result: isVim keeps the code', (t) => {
    const {container} = render(<Result isVim={true} code="const b = 2;" resultReady={true}/>);
    
    const result = container.querySelector('.cm-content').textContent;
    const expected = 'const b = 2;';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});
