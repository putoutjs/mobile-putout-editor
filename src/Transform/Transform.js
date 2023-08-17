import {
    useCallback,
    useEffect,
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {createTransformRunner} from '../trasformer.js';

export function Transform({gistReady, source, transform, setCode, setSource, setTransform, setFinalTransform, setError, setInfo}) {
    const onChange = useCallback((value) => {
        if (!gistReady)
            return;
        
        const runTransform = createTransformRunner('transform');
        
        runTransform(value, {
            source,
            setSource,
            setCode,
            setInfo,
            setTransform,
            setError,
            setFinalTransform,
        });
    }, [
        source,
        setSource,
        setCode,
        setTransform,
        setFinalTransform,
        setError,
        setInfo,
        gistReady,
    ]);
    
    useEffect(() => {
        onChange(transform);
    }, [
        source,
        transform,
        onChange,
        setCode,
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
    
    const value = gistReady ? transform : '';
    
    return (
        <CodeMirror
            value={value}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={extensions}
            onChange={onChange}
        />
    );
}

