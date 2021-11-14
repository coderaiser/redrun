'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {
    reRequire,
    stopAll,
} = mockRequire;

test('redrun: madrun', async (t) => {
    const run = stub()
        .returns('eslint lib');
    
    mockRequire('madrun', {run});
    
    const redrun = reRequire('..');
    
    await redrun('lint', {
        lint: 'madrun lint',
    });
    
    stopAll();
    
    t.calledWith(run, ['lint', ''], 'should call madrun');
    t.end();
});

test('redrun: madrun.js', async (t) => {
    const redrun = reRequire('..');
    
    const result = await redrun('lint', {
        lint: 'bin/madrun.js lint',
    });
    
    t.equal(result, 'bin/madrun.js lint');
    t.end();
});

