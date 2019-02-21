'use strict';

const {
    run,
    parallel,
} = require('madrun');

module.exports = {
    'lint': () => run(['putout', 'lint:*']),
    'lint:bin': () => `eslint --rule 'no-console:0,no-process-exit:0' bin`,
    'lint:lib': () => 'eslint lib test madrun.js',
    'putout': () => 'putout bin lib test madrun.js',
    'fix:lint': () => {
        const putout = run('putout', '--fix');
        const eslint = parallel('lint:*', '--fix');
        
        return `${putout} && ${eslint}`;
    },
    'test': () => 'tape test/**/*.js',
    'watch:test': () => run('watcher', run('test')),
    'watch:tape': () => 'nodemon -w test -w lib --exec tape',
    'watch:coverage:base': () => run('watcher', `nyc ${run('test')}`),
    'watch:coverage:tape': () => run(['watcher'], 'nyc tape'),
    'watch:coverage': () => run('watch:coverage:base'),
    'watch:lint': () => run('watcher', run('lint:eslint*')),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'coverage': () => `nyc ${run('test')}`,
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'postpublish': () => 'npm i -g',
};

