import {test} from 'supertape';
import api from './Gist/api.js';
import {stubFetch} from '../test/fetch.js';

const callApi = async (path, options) => {
    const urls = [];
    const restore = stubFetch((url) => {
        urls.push(url);
    });
    
    await api(path, options);
    restore();
    
    return urls;
};

test('api: default host and path prefix', async (t) => {
    const [result] = await callApi('/gist');
    const expected = 'https://putout.cloudcmd.io/api/v1/gist';
    
    t.equal(result, expected);
    t.end();
});

test('api: passes options to fetch', async (t) => {
    const calls = [];
    const restore = stubFetch((url, options) => {
        calls.push(options);
    });
    
    await api('/gist', {method: 'POST'});
    restore();
    
    const [result] = calls;
    const expected = {method: 'POST'};
    
    t.deepEqual(result, expected);
    t.end();
});

test('api: API_HOST env overrides the host', async (t) => {
    process.env.API_HOST = 'http://localhost:1234';
    
    const {default: apiWithHost} = await import('./Gist/api.js?host');
    const urls = [];
    const restore = stubFetch((url) => {
        urls.push(url);
    });
    
    await apiWithHost('/gist');
    
    restore();
    delete process.env.API_HOST;
    
    const [result] = urls;
    const expected = 'http://localhost:1234/api/v1/gist';
    
    t.equal(result, expected);
    t.end();
});
