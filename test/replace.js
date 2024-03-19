import test from 'supertape';
import replace from '../lib/replace.js';

test('replace: one npm run ', async (t) => {
    const result = await replace('npm run one', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'one', 'should get script name');
    t.end();
});

test('replace: npm tst', async (t) => {
    const result = await replace('npm tst', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'test', 'should determine reserved: tst');
    t.end();
});

test('replace: npm t', async (t) => {
    const result = await replace('npm t', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'test', 'should determine reserved: t');
    t.end();
});

test('replace: npm version', async (t) => {
    const result = await replace('npm version', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'npm version', 'should leave unchanged "npm version"');
    t.end();
});

test('replace: npm publish', async (t) => {
    const result = await replace('npm publish', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(result, 'npm publish', 'should leave unchanged "npm publish"');
    t.end();
});

test('replace: a few npm runs', async (t) => {
    const cmd = await replace('npm run one && npm run two', (type, str) => {
        t.equal(type, 'npm', 'type should be npm');
        return str;
    });
    
    t.equal(cmd, 'one && two', 'should cut npm run from all expressions');
    t.end();
});
