import wraptile from 'wraptile';
import {create} from '../Gist/gist.js';
import DefaultSettings from '../Gist/DefaultSettings.js';

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
    
    globalThis.location.hash = revision.getPath();
    
    setSuccess(<span>☝️Continue in 🐊<a href={link}>Putout Editor</a></span>);
});
