'use strict';

const {run} = require('madrun');

module.exports = {
    'lint': () => 'putout bin lib test .madrun.js --cache',
    'fix:lint': () => run('lint', '--fix'),
    'test': () => 'tape test/**/*.js',
    'watch:test': () => run('watcher', run('test')),
    'watch:tape': () => 'nodemon -w test -w lib --exec tape',
    'watch:coverage:base': () => run('watcher', `nyc ${run('test')}`),
    'watch:coverage:tape': () => run('watcher', 'nyc tape'),
    'watch:coverage': () => run('watch:coverage:base'),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'coverage': () => `nyc ${run('test')}`,
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'postpublish': () => 'npm i -g',
};

