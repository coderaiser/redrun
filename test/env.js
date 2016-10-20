'use strict';

const test = require('tape');
const env = require('../lib/env');

test('env: $PATH', (t) => {
    const path = env.path('hello:world', ':', 'home', '/');
    
    t.equal(path, 'home/node_modules/.bin:hello:world', 'should build PATH');
    t.end();
});

test('env: $npm_package_config', (t) => {
    const result = {
        npm_package_config_poly: 'hello'
    };
    
    const config = env.config({
        poly: 'hello'
    });
    
    t.deepEqual(config, result, 'should build npm config');
    t.end();
});

test('env: $npm_package_config', (t) => {
    const result = {
        npm_package_config_compile_client: 'hello'
    };
    
    const config = env.config({
        compile: {
            client: 'hello'
        }
    });
    
    t.deepEqual(config, result, 'should build npm config');
    t.end();
});

test('env: $npm_package_config: name with "_"', (t) => {
    const result = {
        npm_package_config_compile_client_min: 'hello'
    };
    
    const config = env.config({
        compile: {
            client_min: 'hello'
        }
    });
    
    t.deepEqual(config, result, 'should build npm config');
    t.end();
});

