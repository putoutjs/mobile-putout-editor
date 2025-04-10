import api from './api.js';
import {
    getTransformerByID,
    getParserByID,
} from '../parsers.js';

function getIDAndRevisionFromHash() {
    const match = global.location.hash.match(/^#\/(?!gist\/)([^/]+)(?:\/(latest|\d*))?/);
    
    if (match)
        return {
            id: match[1],
            rev: match[2] || 0,
        };
    
    return null;
}

function fetchSnippet(snippetID, revisionID = 'latest') {
    return api(`/parse/${snippetID}/${revisionID}`)
        .then((response) => {
            if (response.ok)
                return response.json();
            
            switch(response.status) {
            case 404:
                throw Error(`Snippet with ID ${snippetID}/${revisionID} doesn't exist.`);
            
            default:
                throw Error('Unknown error.');
            }
        })
        .then((response) => new Revision(response));
}

export const owns = (snippet) => snippet instanceof Revision;

export function matchesURL() {
    return getIDAndRevisionFromHash() !== null;
}

export function updateHash(revision) {
    const rev = revision.getRevisionID();
    
    global.location.hash = '/' + revision.getSnippetID() + (rev ? `/${rev}` : '');
}

export function fetchFromURL() {
    const urlParameters = getIDAndRevisionFromHash();
    
    if (urlParameters)
        return fetchSnippet(urlParameters.id, urlParameters.rev);
    
    return Promise.resolve(null);
}

/**
 * Create a new snippet.
 */
export function create() {
    return Promise.reject(Error('Saving Parse snippets is not supported anymore.'));
}

/**
 * Update an existing snippet.
 */
export function update() {
    return Promise.reject(Error('Saving Parse snippets is not supported anymore.'));
}

/**
 * Fork existing snippet.
 */
export function fork() {
    return Promise.reject(Error('Saving Parse snippets is not supported anymore.'));
}

class Revision {
    constructor(data) {
        this._data = data;
    }
    
    canSave() {
        return false;
    }
    
    getPath() {
        const rev = this.getRevisionID();
        return '/' + this.getSnippetID() + (rev ? `/${rev}` : '');
    }
    
    getSnippetID() {
        return this._data.snippetID;
    }
    
    getRevisionID() {
        return this._data.revisionID;
    }
    
    getTransformerID() {
        return this._data.toolID;
    }
    
    getTransformCode() {
        const {transform} = this._data;
        
        if (transform)
            return transform;
        
        if (this._data.toolID)
            // Default transforms where never stored
            return getTransformerByID(this._data.toolID).defaultTransform;
        
        return '';
    }
    
    getParserID() {
        const transformerID = this.getTransformerID();
        
        if (transformerID)
            return getTransformerByID(transformerID).defaultParserID;
        
        return this._data.parserID;
    }
    
    getCode() {
        const parserID = this.getParserID();
        
        // Code examples where never stored
        return this._data.code || getParserByID(parserID).category.codeExample;
    }
    
    getParserSettings() {
        const {settings} = this._data;
        
        if (!settings)
            return null;
        
        const parserSettings = settings[this.getParserID()];
        
        return parserSettings && JSON.parse(parserSettings);
    }
    
    getShareInfo() {
        const snippetID = this.getSnippetID();
        const revisionID = this.getRevisionID();
        
        return (
            <div className="shareInfo">
                <dl>
                    <dt>Current Revision</dt>
                    <dd>
                        <input
                            readOnly={true}
                            onFocus={(e) => e.target.select()}
                            value={`https://putout.cloudcmd.io/#/gist/${snippetID}/${revisionID}`}
                        />
                    </dd>
                    <dt>Latest Revision</dt>
                    <dd>
                        <input
                            readOnly={true}
                            onFocus={(e) => e.target.select()}
                            value={`https://putout.cloudcmd.io//#/gist/${snippetID}/latest`}
                        />
                    </dd>
                </dl>
            </div>
        );
    }
}
