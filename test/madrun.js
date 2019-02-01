'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {
    reRequire,
    stopAll,
} = mockRequire;

test('redrun: madrun', (t) => {
    const run = stub()
        .returns('eslint lib');
    
    mockRequire('madrun', {run});
    
    const redrun = reRequire('..');
    
    redrun('lint', {
        'lint': 'madrun lint',
    });
    
    stopAll();
    
    t.ok(run.calledWith('lint', ''), 'should call madrun');
    t.end();
});

test('redrun: madrun.js', (t) => {
    const redrun = reRequire('..');
    
    const result = redrun('lint', {
        'lint': 'bin/madrun.js lint',
    });
    
    t.equal(result, 'bin/madrun.js lint', 'should equal');
    t.end();
});

