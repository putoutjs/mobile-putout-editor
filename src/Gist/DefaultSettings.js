export default {
    v: 2,
    parserID: 'babel',
    toolID: 'putout',
    settings: {
        babel: {
            allowReturnOutsideFunction: true,
            allowUndeclaredExports: true,
            allowImportExportEverywhere: true,
            sourceType: 'module',
            ranges: false,
            tokens: false,
            plugins: [
                'importMeta',
                [
                    'importAttributes',
                    {
                        deprecatedAssertSyntax: true,
                    },
                ],
                'dynamicImport',
                'bigInt',
                'classProperties',
                'decorators-legacy',
                'destructuringPrivate',
                'exportDefaultFrom',
                'throwExpressions',
                [
                    'recordAndTuple',
                    {
                        syntaxType: 'hash',
                    },
                ],
                'explicitResourceManagement',
                'jsx',
                'typescript',
            ],
        },
    },
    versions: {
        babel: '8.0.0-alpha.2',
        putout: '31.2.1',
    },
};
