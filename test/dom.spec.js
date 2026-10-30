import {test} from 'supertape';
import {tryCatch} from 'try-catch';
import {withAsyncSelectionChange} from './dom.js';

test('dom: withAsyncSelectionChange: returns the result of fn', (t) => {
    const result = withAsyncSelectionChange(() => 'hello');
    const expected = 'hello';
    
    t.equal(result, expected);
    t.end();
});

test('dom: withAsyncSelectionChange: rethrows the error of fn', (t) => {
    const [error] = tryCatch(withAsyncSelectionChange, () => {
        throw Error('boom');
    });
    
    t.equal(error.message, 'boom');
    t.end();
});

test('dom: withAsyncSelectionChange: restores dispatchEvent after an error', (t) => {
    const original = document.dispatchEvent;
    
    tryCatch(withAsyncSelectionChange, () => {
        throw Error('boom');
    });
    
    t.equal(document.dispatchEvent, original);
    t.end();
});

test('dom: withAsyncSelectionChange: defers selectionchange, passes other events through', (t) => {
    const original = document.dispatchEvent;
    const seen = [];
    
    document.dispatchEvent = function(event) {
        seen.push(event.type);
        return true;
    };
    
    withAsyncSelectionChange(() => {
        document.dispatchEvent(new Event('click'));
        document.dispatchEvent(new Event('selectionchange'));
    });
    
    const sync = [...seen];
    document.dispatchEvent = original;
    
    t.deepEqual(sync, ['click']);
    t.end();
});
