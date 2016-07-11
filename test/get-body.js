'use strict';

let test = require('tape');
let getBody = require('../lib/get-body');

test('get-body: should get script content', (t) => {
    let cmd = 'jshint lib/*.js';
    
    let body = getBody('lint', {
        lint: cmd
    });
    
    t.equal(body, cmd, 'should body be equal to script content');
    
    t.end();
});

test('get-body: should get script content when name contains args', (t) => {
    let cmd = 'jshint --version';
    
    let body = getBody('lint --version', {
        lint: 'jshint'
    });
    
    t.equal(body, cmd, 'should body be equal to script content + args');
    
    t.end();
});

test('get-body: pre + post + args', (t) => {
    let body = getBody('lint --version', {
        lint: 'jshint',
        prelint: 'pre',
        postlint: 'post'
    });
    
    t.equal(body, 'pre && jshint --version && post', 'should body be equal to script content + args');
    
    t.end();
});

test('get-body: pre + post + args: regexp', (t) => {
    let body = getBody('lint:*', {
        'lint:jshint': 'jshint lib/*.js',
        'lint:jscs': 'jscs lib/*.js',
        'lint:eslint': 'eslint lib/*.js'
    });
    
    t.equal(body, 'jshint lib/*.js && jscs lib/*.js && eslint lib/*.js', 'should body be equal to script content + args');
    
    t.end();
});

test('get-body: args: parallel', (t) => {
    let body = getBody('lint:*', {parallel: true}, {
        'lint:jshint': 'jshint lib/*.js',
        'lint:jscs': 'jscs lib/*.js',
        'lint:eslint': 'eslint lib/*.js'
    });
    
    t.equal(body, 'jshint lib/*.js & jscs lib/*.js & eslint lib/*.js', 'should body be equal to script content + args');
    
    t.end();
});

