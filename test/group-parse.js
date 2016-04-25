'use strict';

let test = require('tape');
let cliParse = require('../lib/group-parse');

test('group-parse: serial', (t) => {
    let result = cliParse(['one', 'two', 'three'], {
        one: 'ls',
        two: 'pwd',
        three: 'whoami'
    });
    
    t.equal(result, 'ls && pwd && whoami', 'should build cmd line');
    
    t.end();
});

test('group-parse: parallel', (t) => {
    let result = cliParse(['one', 'two', 'three'], {parallel: true}, {
        one: 'ls',
        two: 'pwd',
        three: 'whoami'
    });
    
    t.equal(result, 'ls & pwd & whoami', 'should build cmd line');
    
    t.end();
});
