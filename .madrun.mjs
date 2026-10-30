import {run, cutEnv} from 'madrun';
import {defineEnv} from 'supertape/env';

const testEnv = defineEnv({
    dom: true,
    css: true,
    jsx: true,
});

const env = {
    ESLINT_NO_DEV_ERRORS: true,
};

export default {
    'start': () => [env, 'node scripts/start.js'],
    'build': () => 'node scripts/build.js',
    'build:e2e': () => [{E2E_COVERAGE: 1}, 'node scripts/build.js'],
    'test': () => [testEnv, 'supertape "src/**/*.spec.js" "test/**/*.spec.js"'],
    'test:one': () => [testEnv, `supertape ${process.env.SPEC || '"src/**/*.spec.js"'}`],
    'coverage': async () => [testEnv, `superc8 ${await cutEnv('test')}`],
    'test:e2e': () => [{E2E_COVERAGE: 1}, 'playwright test'],
    'report:e2e': () => 'nyc report --nycrc-path .nycrc.e2e.json --reporter=text --reporter=lcov',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
