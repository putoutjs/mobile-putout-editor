import {safeAlign} from 'eslint-plugin-putout';
import {defineConfig} from 'eslint/config';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default defineConfig([
    safeAlign, {
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        plugins: {
            react,
            import: importPlugin,
        },
        rules: {
            'import/no-anonymous-default-export': 'off',
            'react/jsx-curly-brace-presence': ['error', 'never'],
            'react/self-closing-comp': 'error',
            'no-new-func': 'off',
            'default-case': 'off',
        },
    },
]);
