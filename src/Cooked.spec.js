import {test} from 'supertape';
import {render, cleanup} from '@testing-library/react';
import {Cooked} from './Cooked.js';

test('cooked: renders the final transform in a read-only editor', (t) => {
    const {container} = render(<Cooked isVim={false} finalTransform="const a = 1;"/>);
    const result = container.querySelector('.cm-content').textContent;
    const expected = 'const a = 1;';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('cooked: isVim adds the vim extension and keeps the text', (t) => {
    const {container} = render(<Cooked isVim={true} finalTransform="const b = 2;"/>);
    const result = container.querySelector('.cm-content').textContent;
    const expected = 'const b = 2;';
    
    cleanup();
    t.equal(result, expected);
    t.end();
});
