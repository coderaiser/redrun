'use strict';

let test = require('tape');
let redrun = require('..');

test('simplest parse', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('two', {
        scripts: {
            two: cmd
        }
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('infinite loop', (t) => {
    let cmd     = 'echo "hello world"';
    let fn = () => {
        redrun('one', {
            scripts: {
                one: 'npm run two',
                two: 'npm run one'
            }
        });
    };
    
    t.throws(fn, /Too deep traverse. Consider reduce scripts deepness./, 'should throw when infinite loop');
    t.end();
});

test('parse one level deep', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('one', {
        scripts: {
            one: 'npm run two',
            two: cmd
        }
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse arguments', (t) => {
    let cmd     = 'git --version';
    let result  = redrun('one', {
        scripts: {
            one: 'npm run two -- --version',
            two: 'git'
        }
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse reserved names: npm test', (t) => {
    let cmd     = 'tape test/*.js';
    let result  = redrun('one', {
        scripts: {
            one: 'npm run two',
            two: 'npm test',
            test: cmd
        }
    });
    
    t.equal(result, cmd, 'should parse script test');
    t.end();
});

test('parse a few levels deep', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('one', {
        scripts: {
            one: 'npm run two',
            two: 'npm run three',
            three: 'npm run four',
            four: 'npm run five',
            five: 'npm run six',
            six: cmd
        }
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

