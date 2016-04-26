'use strict';

let test = require('tape');
let cliParse = require('../lib/cli-parse');

test('cli-parse: series', (t) => {
    let result = cliParse(['--series', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls && pwd',
        loud: false
    }
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: parallel', (t) => {
    let result = cliParse(['--parallel', 'one', 'two', '--loud'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls & pwd',
        loud: true
    }
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: series and parallel', (t) => {
    let result = cliParse(['--s', 'one', 'two', '-p', 'three', 'four'], {
        one: 'ls',
        two: 'pwd',
        three: 'whoami',
        four: 'ps aux'
    });
    
    let expected = {
        name: 'run',
        cmd: 'whoami & ps aux && ls && pwd',
        loud: false
    }
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: --version', (t) => {
    let version = cliParse.version();
    let result = cliParse(['--version'], {
    });
    
    let expected = {
        name: 'version',
        output: version
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: -v', (t) => {
    let version = cliParse.version();
    let result = cliParse(['-v'], {
    });
    
    let expected = {
        name: 'version',
        output: version
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: --help', (t) => {
    let help = cliParse.help();
    let result = cliParse(['--help'], {
    });
    
    let expected = {
        name: 'help',
        output: help
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: -h', (t) => {
    let help = cliParse.help();
    let result = cliParse(['-h'], {
    });
    
    let expected = {
        name: 'help',
        output: help
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: unknown short argument', (t) => {
    let unknown= cliParse.unknown;
    let result = cliParse(['-w'], {
    });
    
    let expected = {
        name: 'unknown',
        output: unknown('w')
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: unknown long argument', (t) => {
    let unknown= cliParse.unknown;
    let result = cliParse(['--world'], {
    });
    
    let expected = {
        name: 'unknown',
        output: unknown('world')
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: script not found', (t) => {
    let scriptNotFound = cliParse.scriptNotFound;
    let result = cliParse(['hello'], {
    });
    
    let expected = {
        name: 'script-not-found',
        output: scriptNotFound(['hello'])
    }
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});
test('args: no scripts', (t) => {
    let fn = () => cliParse([]);
    t.throws(fn, /scripts should be object!/, 'should throw when no scripts');
    t.end();
});

test('args: no', (t) => {
    t.throws(cliParse, /argv should be an array!/, 'should throw when no args');
    t.end();
});

