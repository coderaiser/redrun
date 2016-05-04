'use strict';

let test = require('tape');
let keys = require('../lib/keys');

test('keys: args: no obj', (t) => {
    t.throws(keys, /obj should be object/, 'should throw when no object');
    
    t.end();
});

test('keys: args: divider not string', (t) => {
    let fn = () => keys(31337, {});
    
    t.throws(fn, /divider should be string!/, 'should throw when divider not string');
    
    t.end();
});

test('keys: get paths', (t) => {
    let expect = [
        'config_plugins',
        'config_compile_client',
        'config_compile_client_min',
        'config_compile_vendor',
        'config_compile_vendor_min'
    ];
    
    let result = keys('_', {
        config: {
            plugins: 'some',
            compile: {
                client: 'hello',
                client_min: 'world',
                vendor: '31337',
                vendor_min: '1337'
            }
        }
    });
    
    t.deepEqual(result, expect, 'should get key pathes');
    t.end();
});

