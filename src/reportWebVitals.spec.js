import {test} from 'supertape';
import reportWebVitals from './reportWebVitals.js';

const noop = () => {};

test('reportWebVitals: no argument: nothing happens', (t) => {
    const result = reportWebVitals();
    
    t.notOk(result);
    t.end();
});

test('reportWebVitals: not a function: nothing happens', (t) => {
    const result = reportWebVitals('not a function');
    
    t.notOk(result);
    t.end();
});

test('reportWebVitals: a function: returns a promise', (t) => {
    const result = reportWebVitals(noop);
    
    t.ok(result instanceof Promise);
    t.end();
});

test('reportWebVitals: a function: registers every metric without throwing', async (t) => {
    const result = await reportWebVitals(noop);
    
    t.notOk(result);
    t.end();
});
