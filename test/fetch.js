export const stubFetch = (handler) => {
    const original = globalThis.fetch;
    
    globalThis.fetch = handler;
    
    return () => {
        globalThis.fetch = original;
    };
};
