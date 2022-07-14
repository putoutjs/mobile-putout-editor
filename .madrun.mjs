import {run} from 'madrun';

const env = {
    ESLINT_NO_DEV_ERRORS: true,
};

export default {
    'start': () => [env, 'react-scripts start'],
    'build': () => 'react-scripts build',
    'test': () => 'react-scripts test',
    'eject': () => 'react-scripts eject',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
