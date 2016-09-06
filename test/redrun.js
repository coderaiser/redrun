'use strict';

const test = require('tape');
const redrun = require('..');

test('simplest parse', (t) => {
    let cmd     = 'echo "hello world"';
    let result  = redrun('two', {
        two: cmd
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: name with "."', (t) => {
    const cmd     = 'bin/redrun.js lint*';
    const result  = redrun('two', {
        two: cmd
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: name with "-"', (t) => {
    let cmd     = 'babel lib/*.js';
    let result  = redrun('build', {
        'build:js': 'echo \'hello\'',
        'build:js-native-full': 'babel lib/*.js',
        'build': 'redrun build:js-native-full',
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: &&', (t) => {
    let cmd     = 'nodemon --exec bin/iocmd.js && pwd';
    let result  = redrun('run', {
        run: 'redrun watch:iocmd && pwd',
        watcher: 'nodemon --exec',
        'watch:iocmd': 'npm run watcher -- bin/iocmd.js'
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('infinite loop', (t) => {
    let fn = () => {
        redrun('one', {
            one: 'npm run two',
            two: 'npm run one'
        });
    };
    
    t.throws(fn, /Too deep traverse. Consider reduce scripts deepness./, 'should throw when infinite loop');
    t.end();
});

test('similar name', (t) => {
    let cmd     = 'redrun.js two';
    let result  = redrun('one', {
        one: 'redrun.js two'
    });
    
    t.equal(result, cmd, 'should not try to parse similar name');
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

test('parse redrun args: "."', (t) => {
    let result  = redrun('one.start', {
        'one.start': 'npm run two',
        two: 'redrun --parallel lint*',
        'lint:jscs': 'jscs test/*.js',
        'lint:jshint': 'jshint lib test'
    });
    
    t.equal(result, 'jscs test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse redrun args: unrecognized', (t) => {
    let result  = redrun('one', {
        one: 'npm run two',
        two: 'redrun hello --fix',
        hello: 'echo'
    });
    
    t.equal(result, 'echo --fix is not a redrun option. See \'redrun  --help\'', 'should return error');
    t.end();
});

test('parse redrun args with ENV set', (t) => {
    let result  = redrun('good', {
        good: 'NODE_ENV=development DEBUG=iocmd* redrun -p t*',
        t1: 'tape test/*.js',
        t2: 'jshint lib test'
    });
    
    t.equal(result, 'NODE_ENV=development DEBUG=iocmd* tape test/*.js & jshint lib test', 'should parse script test');
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

