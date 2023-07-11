import {
    useCallback,
    useEffect,
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {createTransformRunner} from '../trasformer.js';

export function Transform({source, transform, setCode, setSource, setTransform, setFinalTransform, setError, setInfo}) {
    const onChange = useCallback((value) => {
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
    
    return (
        <CodeMirror
            value={transform}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={extensions}
            onChange={onChange}
        />
    );
}

