'use strict';

let test = require('tape');
let redrun = require('..');

test('simplest parse', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('two', {
        two: cmd
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: name with "."', (t) => {
    let cmd     = 'bin/redrun.js lint*';
    let result  = redrun('two', {
        two: cmd
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('infinite loop', (t) => {
    let cmd     = 'echo "hello world"';
    let fn = () => {
        redrun('one', {
            one: 'npm run two',
            two: 'npm run one'
        });
    };
    
    t.throws(fn, /Too deep traverse. Consider reduce scripts deepness./, 'should throw when infinite loop');
    t.end();
});

test('parse one level deep', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('one', {
        one: 'npm run two',
        two: cmd
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse arguments', (t) => {
    let cmd     = 'git --version';
    let result  = redrun('one', {
        one: 'npm run two -- --version',
        two: 'git'
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse reserved names: npm test', (t) => {
    let cmd     = 'tape test/*.js';
    let result  = redrun('one', {
        one: 'npm run two',
        two: 'npm test',
        test: cmd
    });
    
    t.equal(result, cmd, 'should parse script test');
    t.end();
});

test('parse redrun args', (t) => {
    let result  = redrun('one', {
        one: 'npm run two',
        two: 'redrun --parallel test lint',
        test: 'tape test/*.js',
        lint: 'jshint lib test'
    });
    
    t.equal(result, 'tape test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse redrun args: "*"', (t) => {
    let result  = redrun('one', {
        one: 'npm run two',
        two: 'redrun --parallel lint*',
        'lint:jscs': 'jscs test/*.js',
        'lint:jshint': 'jshint lib test'
    });
    
    t.equal(result, 'jscs test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse a few redrun scripts', (t) => {
    let result  = redrun('one', {
        one: 'redrun -p two three',
        two: 'redrun four five',
        three: 'echo \'hello\'',
        four: 'jshint lib',
        five: 'jscs test'
    });
    
    t.equal(result, 'jshint lib && jscs test & echo \'hello\'', 'should parse script test');
    t.end();
});

test('parse a few levels deep', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('one', {
        one: 'npm run two',
        two: 'npm run three',
        three: 'npm run four',
        four: 'npm run five',
        five: 'npm run six',
        six: cmd
    });
    
    t.equal(result, cmd, 'should parse command a few levels deep');
    t.end();
});

test('args: no name', (t) => {
    t.throws(redrun, /name should be string!/, 'should throw when no name');
    t.end();
});

test('args: no json', (t) => {
    let fn = () => {
        redrun('on');
    };
    
    t.throws(fn, /json should be object!/, 'should throw when no json');
    t.end();
});

