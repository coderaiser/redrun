'use strict';

let test = require('tape');
let replace = require('../lib/replace');

test('replace: one npm run ', (t) => {
    replace('npm run one', (str) => {
        t.equal(str, 'one', 'should get script name');
    });
    
    t.end();
});

test('replace: a few npm runs', (t) => {
    let cmd = replace('npm run one && npm run two', (str) => {
        return str;
    });
    
    t.equal(cmd, 'one && two', 'should cut npm run from all expressions');
    
    t.end();
});

test('replace: arguments', (t) => {
    let cmd = replace('npm run one -- --help && npm run two -- --version', (str) => {
        return str;
    });
    
    t.equal(cmd, 'one --help && two --version', 'should cut npm run and leave arguments');
    
    t.end();
});

