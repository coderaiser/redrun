'use strict';

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const redrun = require('..');

test('simplest parse', async (t) => {
    const cmd = 'echo "hello world"';
    const result = await redrun('two', {
        two: cmd,
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: name with "."', async (t) => {
    const cmd = 'bin/redrun.js lint*';
    const result = await redrun('two', {
        two: cmd,
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: name with "-"', async (t) => {
    const cmd = 'babel lib/*.js';
    const result = await redrun('build', {
        'build:js': `echo 'hello'`,
        'build:js-native-full': 'babel lib/*.js',
        'build': 'redrun build:js-native-full',
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: "npm install"', async (t) => {
    const cmd = 'npm install';
    const result = await redrun('two', {
        two: cmd,
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: "--"', async (t) => {
    const cmd = 'echo -- --hello';
    const result = await redrun('echo--', {
        'echo--': cmd,
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('simplest parse: &&', async (t) => {
    const cmd = 'nodemon --exec "bin/iocmd.js" && pwd';
    const result = await redrun('run', {
        'run': 'redrun watch:iocmd && pwd',
        'watcher': 'nodemon --exec',
        'watch:iocmd': 'npm run watcher -- bin/iocmd.js',
    });
    
    t.equal(result, cmd, 'should return cmd');
    t.end();
});

test('infinite loop', async (t) => {
    const result = await redrun('one', {
        one: 'redrun one',
    });
    
    const expected = 'echo "Inifinite loop detected: one -> one"';
    
    t.equal(result, expected);
    t.end();
});

test('infinite loop: one step', async (t) => {
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'npm run one',
    });
    
    const expected = 'echo "Inifinite loop detected: one: npm run two -> npm run one"';
    
    t.equal(result, expected, 'should determine infinite loop');
    t.end();
});

test('infinite loop: more steps', async (t) => {
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'npm run three',
        three: 'npm run four',
        four: 'npm run one',
    });
    
    const expected = 'echo "Inifinite loop detected: one: npm run two -> npm run three -> npm run four -> npm run one"';
    
    t.equal(result, expected, 'should determine infinite loop');
    t.end();
});

test('similar name', async (t) => {
    const cmd = 'redrun.js two';
    const result = await redrun('one', {
        one: 'redrun.js two',
    });
    
    t.equal(result, cmd, 'should not try to parse similar name');
    t.end();
});

test('parse one level deep', async (t) => {
    const cmd = 'echo "hello world"';
    const result = await redrun('one', {
        one: 'npm run two',
        two: cmd,
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse arguments', async (t) => {
    const cmd = 'git "--version"';
    const result = await redrun('one', {
        one: 'npm run two -- --version',
        two: 'git',
    });
    
    t.equal(result, cmd, 'should parse command one leve deep');
    t.end();
});

test('parse reserved names: npm test', async (t) => {
    const cmd = 'tape test/*.js';
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'npm test',
        test: cmd,
    });
    
    t.equal(result, cmd, 'should parse script test');
    t.end();
});

test('parse redrun args', async (t) => {
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'redrun --parallel test lint',
        test: 'tape test/*.js',
        lint: 'jshint lib test',
    });
    
    t.equal(result, 'tape test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse redrun args: "*"', async (t) => {
    const result = await redrun('one', {
        'one': 'npm run two',
        'two': 'redrun --parallel lint*',
        'lint:jscs': 'jscs test/*.js',
        'lint:jshint': 'jshint lib test',
    });
    
    t.equal(result, 'jscs test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse redrun args: "."', async (t) => {
    const result = await redrun('one.start', {
        'one.start': 'npm run two',
        'two': 'redrun --parallel lint*',
        'lint:jscs': 'jscs test/*.js',
        'lint:jshint': 'jshint lib test',
    });
    
    t.equal(result, 'jscs test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse redrun args: "--": npm run', async (t) => {
    const expect = 'nodemon -w lib --exec "nyc tape test.js"';
    const result = await redrun('watch-coverage', {
        'watcher': 'nodemon -w lib --exec',
        'coverage': 'nyc npm test',
        'watch-coverage': 'npm run watcher -- "npm run coverage"',
        'test': 'tape test.js',
    });
    
    t.equal(result, expect, 'should add quotes to arguments');
    t.end();
});

test('parse redrun args: "--": npm run: should not add quotes', async (t) => {
    const expect = `nodemon -w lib --exec 'nyc tape test.js'`;
    const result = await redrun('watch-coverage', {
        'watcher': 'nodemon -w lib --exec',
        'coverage': 'nyc npm test',
        'watch-coverage': `npm run watcher -- 'npm run coverage'`,
        'test': 'tape test.js',
    });
    
    t.equal(result, expect, 'should not add quotes when there is one');
    t.end();
});

test('parse redrun args: "--": quotes', async (t) => {
    const expect = `nodemon -w test -w lib --exec "tape 'lib/**/*.spec.js'"`;
    const result = await redrun('watch:test', {
        'test': `tape 'lib/**/*.spec.js'`,
        'watch:test': 'npm run watcher -- npm test',
        'watcher': 'nodemon -w test -w lib --exec',
    });
    
    t.equal(result, expect, 'should add quotes to arguments');
    t.end();
});

test('parse redrun args: "--": redrun', async (t) => {
    const expect = 'nodemon -w lib --exec "bin/iocmd.js"';
    const result = await redrun('watch:iocmd', {
        'watch:iocmd': 'redrun watcher -- bin/iocmd.js',
        'watcher': 'nodemon -w lib --exec',
    });
    
    t.equal(result, expect, 'should add quotes to arguments');
    t.end();
});

test('parse redrun args: "--": deep npm run', async (t) => {
    const expect = 'echo "es5" && echo "es6"';
    const result = await redrun('echo:*', {
        'echo': 'echo',
        'echo:es5': 'npm run echo -- "es5"',
        'echo:es6': 'npm run echo -- "es6"',
    });
    
    t.equal(result, expect, 'should add quotes to arguments');
    t.end();
});

test('parse redrun args: "--": should not quote "--"', async (t) => {
    const expect = 'browserify -s nessy "src/nessy.js" "-o" "dist/nessy.es6.js"';
    const result = await redrun('es6', {
        'bundle': 'browserify -s nessy',
        'es6:base': 'npm run bundle -- src/nessy.js',
        'es6': 'npm run es6:base -- -o dist/nessy.es6.js',
    });
    
    t.equal(result, expect, 'should add quotes to arguments');
    t.end();
});

test('parse redrun args: unrecognized', async (t) => {
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'redrun hello --fix',
        hello: 'echo',
    });
    
    t.equal(result, `echo --fix is not a redrun option. See 'redrun  --help'`, 'should return error');
    t.end();
});

test('parse redrun args with ENV set', async (t) => {
    const result = await redrun('good', {
        good: 'NODE_ENV=development DEBUG=iocmd* redrun -p t*',
        t1: 'tape test/*.js',
        t2: 'jshint lib test',
    });
    
    t.equal(result, 'NODE_ENV=development DEBUG=iocmd* tape test/*.js & jshint lib test', 'should parse script test');
    t.end();
});

test('parse a few redrun scripts', async (t) => {
    const result = await redrun('one', {
        one: 'redrun -p two three',
        two: 'redrun four five',
        three: `echo 'hello'`,
        four: 'jshint lib',
        five: 'jscs test',
    });
    
    t.equal(result, `jshint lib && jscs test & echo 'hello'`, 'should parse script test');
    t.end();
});

test('parse a few levels deep', async (t) => {
    const cmd = 'echo "hello world"';
    const result = await redrun('one', {
        one: 'npm run two',
        two: 'npm run three',
        three: 'npm run four',
        four: 'npm run five',
        five: 'npm run six',
        six: cmd,
    });
    
    t.equal(result, cmd, 'should parse command a few levels deep');
    t.end();
});

test('npx', async (t) => {
    const cmd = 'npx pug -b src src/pages -o dist';
    const body = await redrun('build', {
        'build': 'npx redrun build:html',
        'build:html': cmd,
    });
    
    t.equal(body, cmd, 'should count npx');
    t.end();
});

test('args: no name', async (t) => {
    const [e] = await tryToCatch(redrun);
    
    t.equal(e.message, 'name should be string!', 'should throw when no name');
    t.end();
});

test('args: name is empty', async (t) => {
    const [e] = await tryToCatch(redrun, '');
    
    t.equal(e.message, 'name should not be empty!', 'should throw when name is empty');
    t.end();
});

test('args: no json', async (t) => {
    const [e] = await tryToCatch(redrun, 'on');
    
    t.equal(e.message, 'json should be object!', 'should throw when no json');
    t.end();
});
