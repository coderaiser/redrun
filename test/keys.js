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

test('env: $npm_package_config', (t) => {
    let expect = ['compile_client', 'run_server'];
    let result = keys('_', {
        compile: {
            client: 'hello'
        },
        run: {
            server: 'ok'
        }
    });
    
    t.deepEqual(result, expect, 'should get key pathes');
    t.end();
});

