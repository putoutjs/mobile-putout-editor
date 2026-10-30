export const loadBundle = () => import('@putout/bundle');

export const loadFlatlint = () => import('flatlint/with-plugins');

export const loadPlugins = () => Promise.all([
    import('@putout/plugin-putout'),
    import('@putout/plugin-declare'),
    import('@putout/plugin-declare-before-reference'),
    import('@putout/plugin-convert-const-to-let'),
    import('@putout/plugin-nodejs/convert-esm-to-commonjs'),
    import('@putout/plugin-optional-chaining'),
    import('@putout/plugin-merge-destructuring-properties'),
    import('@putout/plugin-extract-keywords-from-variables'),
    import('@putout/plugin-types'),
    import('@putout/plugin-maybe'),
]);
