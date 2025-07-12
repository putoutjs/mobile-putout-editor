import {run} from 'madrun';

const env = {
    ESLINT_NO_DEV_ERRORS: true,
};

export default {
    'start': () => [env, 'react-scripts start'],
    'build': () => 'node scripts/build.js',
    'test': () => 'node scripts/test.js',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
