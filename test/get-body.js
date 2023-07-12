'use strict';

const test = require('supertape');
const getBody = require('../lib/get-body');

test('get-body: should get script content', (t) => {
    const cmd = 'jshint lib/*.js';
    
    const body = getBody('lint', {
        lint: cmd,
    });
    
    t.equal(body, cmd, 'should body be equal to script content');
    t.end();
});

test('get-body: should get script content: name with "."', (t) => {
    const cmd = 'jshint lib/*.js';
    
    const body = getBody('lint.one', {
        'lint.one': cmd,
    });
    
    t.equal(body, cmd, 'should body be equal to script content');
    t.end();
});

test('get-body: should get script content when name contains args', (t) => {
    const cmd = 'jshint --version';
    
    const body = getBody('lint --version', {
        lint: 'jshint',
    });
    
    t.equal(body, cmd, 'should body be equal to script content + args');
    t.end();
});

test('get-body: pre + post + args', (t) => {
    const body = getBody('lint --version', {
        lint: 'jshint',
        prelint: 'pre',
        postlint: 'post',
    });
    
    t.equal(body, 'pre && jshint --version && post', 'should body be equal to script content + args');
    t.end();
});

test('get-body: pre + post + args: regexp', (t) => {
    const body = getBody('lint:*', {
        'lint:jshint': 'jshint lib/*.js',
        'lint:jscs': 'jscs lib/*.js',
        'lint:eslint': 'eslint lib/*.js',
    });
    
    t.equal(body, 'jshint lib/*.js && jscs lib/*.js && eslint lib/*.js', 'should body be equal to script content + args');
    t.end();
});

test('get-body: pre + post + symbols: regexp', (t) => {
    const cmd = 'pre && jshint --version && post';
    const result = getBody('lint:*', {
        'lint:': 'jshint --version',
        'prelint:': 'pre',
        'postlint:': 'post',
    });
    
    t.equal(result, cmd, 'should body be equal to script content + args');
    t.end();
});

test('get-body: args: parallel', (t) => {
    const body = getBody('lint:*', {parallel: true}, {
        'lint:jshint': 'jshint lib/*.js',
        'lint:jscs': 'jscs lib/*.js',
        'lint:eslint': 'eslint lib/*.js',
    });
    
    t.equal(body, 'jshint lib/*.js & jscs lib/*.js & eslint lib/*.js', 'should body be equal to script content + args');
    t.end();
});
