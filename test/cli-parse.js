'use strict';

let test = require('tape');
let cliParse = require('../lib/cli-parse');

test('cli-parse: serial', (t) => {
    let result = cliParse(['one', 'two', 'three'], {
        scripts: {
            one: 'ls',
            two: 'pwd',
            three: 'whoami'
        }
    });
    
    t.equal(result, 'ls && pwd && whoami', 'should build cmd line');
    
    t.end();
});

test('cli-parse: parallel', (t) => {
    let result = cliParse(['one', 'two', 'three'], {parallel: true}, {
        scripts: {
            one: 'ls',
            two: 'pwd',
            three: 'whoami'
        }
    });
    
    t.equal(result, 'ls & pwd & whoami', 'should build cmd line');
    
    t.end();
});
