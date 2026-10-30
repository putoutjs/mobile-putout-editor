import {test} from 'supertape';
import {render, cleanup, fireEvent, waitFor} from '@testing-library/react';
import MainMenu from './Menu.js';
import DefaultSource from '../Source/DefaultSource.js';
import DefaultTransform from '../Transform/DefaultTransform.js';
import DefaultFilesystemSource from '../Source/DefaultFilesystemSource.js';
import DefaultFilesystemTransform from '../Transform/DefaultFilesystemTransform.js';
import {stubFetch} from '../../test/fetch.js';

const gist = {
    id: 'abc',
    history: [{
        version: 'rev1',
    }],
    files: {
        'astexplorer.json': {
            content: JSON.stringify({
                v: 2,
            }),
        },
    },
};

const mount = () => {
    const calls = {
        source: [],
        transform: [],
        success: [],
    };
    
    const view = render(<MainMenu
        source="const a = 1;"
        transform="export const report = () => 'x';"
        setSource={(a) => calls.source.push(a)}
        setTransform={(a) => calls.transform.push(a)}
        setSuccess={(a) => calls.success.push(a)}
    />);
    
    return {
        ...view,
        calls,
    };
};

const open = ({getByRole}) => fireEvent.click(getByRole('button', {
    name: 'more',
}));

const gone = async (view) => {
    await waitFor(() => {
        if (view.queryAllByRole('menuitem').length)
            throw Error('still open');
    });
};

test('menu: closed by default', (t) => {
    const view = mount();
    
    const result = view.queryAllByRole('menuitem').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('menu: opens on button click with three items', (t) => {
    const view = mount();
    
    open(view);
    
    const result = view.getAllByRole('menuitem').map((item) => item.textContent);
    const expected = [
        'New',
        'New Filesystem',
        'Save',
    ];
    
    cleanup();
    t.deepEqual(result, expected);
    t.end();
});

test('menu: shows the version from REACT_APP_VERSION', (t) => {
    const {container} = mount();
    
    const result = container.querySelector('small').textContent;
    const expected = `v${process.env.REACT_APP_VERSION ?? ''}`;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('menu: New sets the default transform and source', (t) => {
    const view = mount();
    
    open(view);
    fireEvent.click(view.getByRole('menuitem', {
        name: 'New',
    }));
    
    const result = {
        transform: view.calls.transform,
        source: view.calls.source,
    };
    
    const expected = {
        transform: [DefaultTransform],
        source: [DefaultSource],
    };
    
    cleanup();
    t.deepEqual(result, expected);
    t.end();
});

test('menu: New closes the menu', async (t) => {
    const view = mount();
    
    open(view);
    fireEvent.click(view.getByRole('menuitem', {
        name: 'New',
    }));
    
    await gone(view);
    
    const result = view.queryAllByRole('menuitem').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('menu: New Filesystem sets the filesystem transform and source', (t) => {
    const view = mount();
    
    open(view);
    fireEvent.click(view.getByRole('menuitem', {
        name: 'New Filesystem',
    }));
    
    const result = {
        transform: view.calls.transform,
        source: view.calls.source,
    };
    
    const expected = {
        transform: [DefaultFilesystemTransform],
        source: [DefaultFilesystemSource],
    };
    
    cleanup();
    t.deepEqual(result, expected);
    t.end();
});

test('menu: Save posts the gist and calls setSuccess', async (t) => {
    const restore = stubFetch(() => Promise.resolve({
        ok: true,
        json: async () => gist,
    }));
    
    const hashBefore = globalThis.location.hash;
    const view = mount();
    
    open(view);
    fireEvent.click(view.getByRole('menuitem', {
        name: 'Save',
    }));
    
    await waitFor(() => {
        if (!view.calls.success.length)
            throw Error('not saved yet');
    });
    
    const result = view.calls.success.length;
    const expected = 1;
    
    globalThis.location.hash = hashBefore;
    restore();
    cleanup();
    t.equal(result, expected);
    t.end();
});

test('menu: closes on backdrop click', async (t) => {
    const view = mount();
    
    open(view);
    fireEvent.click(document.querySelector('.MuiBackdrop-root'));
    
    await gone(view);
    
    const result = view.queryAllByRole('menuitem').length;
    const expected = 0;
    
    cleanup();
    t.equal(result, expected);
    t.end();
});
