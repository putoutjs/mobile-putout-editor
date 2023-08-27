import {useCallback} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {createTransformRunner} from '../trasformer.js';

export function Source({source, transform, setCode, setSource, setTransform, setFinalTransform, setError, setInfo, setResultReady}) {
    const onChange = useCallback((value) => {
        const runTransform = createTransformRunner('source');
        
        runTransform(transform, {
            source: value,
            setCode,
            setInfo,
            setTransform,
            setSource,
            setError,
            setFinalTransform,
            setResultReady,
        });
    }, [
        transform,
        setCode,
        setSource,
        setTransform,
        setFinalTransform,
        setError,
        setInfo,
    ]);
    
    const extensions = [
        javascript({
            jsx: true,
            typescript: true,
        }),
    ];
    
    return (
        <CodeMirror
            value={source}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={extensions}
            onChange={onChange}
        />
    );
}

