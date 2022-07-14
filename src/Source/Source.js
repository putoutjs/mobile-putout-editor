import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';

import {createTransformRunner} from '../trasformer.js';

export function Source({source, transform, setCode, setTransform, setFinalTransform, setError, setInfo}) {
    const onChange = useCallback((value) => {
        const runTransform = createTransformRunner('source');
        runTransform(transform, {
            source: value,
            setCode,
            setInfo,
            setTransform,
            setError,
            setFinalTransform,
        });
    }, [transform, setCode, setTransform, setFinalTransform, setError, setInfo]);
    
    return (
        <CodeMirror
            value={source}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={[javascript({jsx: true})]}
            onChange={onChange}
        />
    );
}
