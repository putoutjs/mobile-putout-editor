import {tryCatch} from 'try-catch';

export const withAsyncSelectionChange = (fn) => {
    const original = document.dispatchEvent;
    
    document.dispatchEvent = function(event) {
        if (event.type !== 'selectionchange')
            return original.call(this, event);
        
        queueMicrotask(() => {
            original.call(this, event);
        });
        
        return true;
    };
    
    const [error, result] = tryCatch(fn);
    
    document.dispatchEvent = original;
    
    if (error)
        throw error;
    
    return result;
};
