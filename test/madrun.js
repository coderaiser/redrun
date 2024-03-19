import {test, stub} from 'supertape';
import redrun from '../lib/redrun.js';

test('redrun: madrun', async (t) => {
    const run = stub().returns('eslint lib');
    const madrun = {
        run,
    };
    
    const options = {};
    
    const scripts = {
        lint: 'madrun lint',
    };
    
    await redrun('lint', options, scripts, {
        madrun,
    });
    
    t.calledWith(run, ['lint', ''], 'should call madrun');
    t.end();
});

test('redrun: madrun.js', async (t) => {
    const result = await redrun('lint', {
        lint: 'bin/madrun.js lint',
    });
    
    t.equal(result, 'bin/madrun.js lint');
    t.end();
});
