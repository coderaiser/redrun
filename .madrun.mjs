import {
    run,
    cutEnv,
} from 'madrun';

const env = {
    SUPERTAPE_CHECK_ASSERTIONS_COUNT: 0,
    SUPERTAPE_CHECK_SCOPES: 0,
};

export default {
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'test': () => [env, 'tape test/**/*.js'],
    'watch:test': async () => [env, await run('watcher', await cutEnv('test'))],
    'watch:tape': () => 'nodemon -w test -w lib --exec tape',
    'watch:coverage:base': async () => [env, await run('watcher', `nyc ${await cutEnv('test')}`)],
    'watch:coverage:tape': () => run('watcher', 'nyc tape'),
    'watch:coverage': async () => [env, await cutEnv('watch:coverage:base')],
    'watcher': () => 'nodemon -w test -w lib --exec',
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'report': () => 'c8 report --reporter=lcov',
    'postpublish': () => 'npm i -g',
};
