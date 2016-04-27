'use strict';

let test = require('tape');
let replace = require('../lib/replace');

test('replace: one npm run ', (t) => {
    let result = replace('npm run one', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'one', 'should get script name');
    t.end();
});

test('replace: npm tst', (t) => {
    let result = replace('npm tst', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'test', 'should determine reserved: tst');
    
    t.end();
});

test('replace: npm t', (t) => {
    let result = replace('npm t', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'test', 'should determine reserved: t');
    
    t.end();
});

test('replace: a few npm runs', (t) => {
    let cmd = replace('npm run one && npm run two', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(cmd, 'one && two', 'should cut npm run from all expressions');
    
    t.end();
});

test('replace: arguments', (t) => {
    let cmd = replace('npm run one -- --help && npm run two -- --version', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(cmd, 'one --help && two --version', 'should cut npm run and leave arguments');
    
    t.end();
});

