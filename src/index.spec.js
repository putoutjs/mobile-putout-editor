import {test} from 'supertape';
import {cleanup, waitFor} from '@testing-library/react';

test('index: renders the App into #root', async (t) => {
    const root = document.createElement('div');
    
    root.id = 'root';
    document.body.append(root);
    
    await import('./index.js?index=.js');
    
    await waitFor(() => {
        if (!root.children.length)
            throw Error('not rendered yet');
    });
    
    const result = root.children.length;
    
    root.remove();
    cleanup();
    
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});
