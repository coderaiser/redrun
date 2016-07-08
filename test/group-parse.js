'use strict';

let test = require('tape');
let groupParse = require('../lib/group-parse');

test('group-parse: serial', (t) => {
    let result = groupParse(['one', 'two', 'three'], {
        one: 'ls',
        two: 'pwd',
        three: 'whoami'
    });
    
    t.equal(result, 'ls && pwd && whoami', 'should build cmd line');
    
    t.end();
});

test('group-parse: parallel', (t) => {
    let result = groupParse(['one', 'two', 'three'], {parallel: true}, {
        one: 'ls',
        two: 'pwd',
        three: 'whoami'
    });
    
    t.equal(result, 'ls & pwd & whoami', 'should build cmd line');
    
    t.end();
});

test('group-parse: parallel: params', (t) => {
    const options = {
        params: ' --help',
        parallel: true
    };
    
    let result = groupParse(['one', 'two', 'three'], options, {
        one: 'ls',
        two: 'pwd',
        three: 'whoami'
    });
    
    t.equal(result, 'ls --help & pwd --help & whoami --help', 'should build cmd line with params');
    
    t.end();
});
