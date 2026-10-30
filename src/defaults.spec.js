import {test} from 'supertape';
import DefaultSource from './Source/DefaultSource.js';
import DefaultFilesystemSource from './Source/DefaultFilesystemSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';
import DefaultFilesystemTransform from './Transform/DefaultFilesystemTransform.js';
import DefaultSettings from './Gist/DefaultSettings.js';

const isNonEmptyString = (a) => typeof a === 'string' && a.length > 0;

test('defaults: DefaultSource is a non-empty string', (t) => {
    const result = isNonEmptyString(DefaultSource);
    
    t.ok(result);
    t.end();
});

test('defaults: DefaultFilesystemSource is a non-empty string', (t) => {
    const result = isNonEmptyString(DefaultFilesystemSource);
    
    t.ok(result);
    t.end();
});

test('defaults: DefaultTransform is a non-empty string', (t) => {
    const result = isNonEmptyString(DefaultTransform);
    
    t.ok(result);
    t.end();
});

test('defaults: DefaultFilesystemTransform is a non-empty string', (t) => {
    const result = isNonEmptyString(DefaultFilesystemTransform);
    
    t.ok(result);
    t.end();
});

test('defaults: DefaultTransform has report and replace', (t) => {
    const result = [
        DefaultTransform.includes('export const report'),
        DefaultTransform.includes('export const replace'),
    ];
    
    const expected = [true, true];
    
    t.deepEqual(result, expected);
    t.end();
});

test('defaults: DefaultFilesystemTransform has report and fix', (t) => {
    const result = [
        DefaultFilesystemTransform.includes('export const report'),
        DefaultFilesystemTransform.includes('export const fix'),
    ];
    
    const expected = [true, true];
    
    t.deepEqual(result, expected);
    t.end();
});

test('defaults: DefaultSettings: version, parser and tool', (t) => {
    const {v, parserID, toolID} = DefaultSettings;
    
    const result = {
        v,
        parserID,
        toolID,
    };
    
    const expected = {
        v: 2,
        parserID: 'babel',
        toolID: 'putout',
    };
    
    t.deepEqual(result, expected);
    t.end();
});
