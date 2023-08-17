import {
    create,
    fetchFromURL,
} from '../Gist/gist.js';
import DefaultSettings from '../Gist/DefaultSettings.js';
import wraptile from 'wraptile';

const REDPUT_URL = 'https://github.com/putoutjs/redput';

export const createSave = wraptile(async ({close, source, transform, setSuccess}) => {
    close();
    
    const revision = await create({
        ...DefaultSettings,
        code: source,
        transform,
        filename: 'source.js',
    });
    
    const {id, history} = revision._gist;
    const link = `https://putout.cloudcmd.io/#/gist/${id}/${history[0].version}`;
    
    global.location.hash = revision.getPath();
    
    setSuccess(
        <div>
            <ul>
                <li>☝️Continue in 🐊<a href={link}>Putout Editor</a></li>
                <li>☝️Download with <code><a href={REDPUT_URL}>redput</a></code></li>
            </ul>
        </div>,
    );
});

