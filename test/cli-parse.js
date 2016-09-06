'use strict';

const os = require('os');
const test = require('tape');
const cliParse = require('../lib/cli-parse');

test('cli-parse: series', (t) => {
    let result = cliParse(['--series', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls && pwd',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: parallel', (t) => {
    let result = cliParse(['--parallel', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls & pwd',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: parallel --quiet', (t) => {
    let result = cliParse(['--parallel', 'one', 'two', '--quiet'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls & pwd',
        quiet: true,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: parallel: before script', (t) => {
    let result = cliParse(['main', '--parallel', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
        main: 'echo hi'
    });
    
    let expected = {
        name: 'run',
        cmd: 'echo hi && ls & pwd',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: series and parallel', (t) => {
    let result = cliParse(['--s', 'one', 'two', '-p', 'three', 'four'], {
        one: 'ls',
        two: 'pwd',
        three: 'whoami',
        four: 'ps aux'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls && pwd && whoami & ps aux',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    
    t.end();
});

test('cli-parse: series calm: linux', (t) => {
    const platform = os.platform;
    
    os.platform = () => 'linux';
    
    const result = cliParse(['--series-calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls || true && pwd || true',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "true"');
    
    os.platfrom = platform;
    
    t.end();
});

test('cli-parse: parallel calm: windows', (t) => {
    let platform = os.platform;
    
    os.platform = () => 'win32';
    
    let result = cliParse(['--parallel-calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls || (exit 0) & pwd || (exit 0)',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "exit 0"');
    
    os.platfrom = platform;
    
    t.end();
});

test('cli-parse: --calm: linux', (t) => {
    let platform = os.platform;
    
    os.platform = () => 'linux';
    
    let result = cliParse(['--calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls || true && pwd || true',
        quiet: false,
        calm: true
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "exit 0"');
    
    os.platfrom = platform;
    
    t.end();
});

test('cli-parse: scripts arguments', (t) => {
    let result = cliParse(['o*', '--', '--parallel', 'three', 'four'], {
        one: 'ls'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls --parallel three four',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object that contains arguments');
    
    t.end();
});

test('cli-parse: scripts arguments: parallel', (t) => {
    let result = cliParse(['o*', '--', '--parallel', 'three', 'four'], {
        one: 'ls',
        on: 'who'
    });
    
    let expected = {
        name: 'run',
        cmd: 'ls --parallel three four && who --parallel three four',
        quiet: false,
        calm: false
    };
    
    t.deepEqual(result, expected, 'should build cmd object that contains arguments');
    
    t.end();
});

test('cli-parse: --version', (t) => {
    let version = cliParse.version();
    let result = cliParse(['--version'], {
    });
    
    let expected = {
        name: 'version',
        output: version
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: -v', (t) => {
    let version = cliParse.version();
    let result = cliParse(['-v'], {
    });
    
    let expected = {
        name: 'version',
        output: version
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: --help', (t) => {
    let help = cliParse.help();
    let result = cliParse(['--help'], {
    });
    
    let expected = {
        name: 'help',
        output: help
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: -h', (t) => {
    let help = cliParse.help();
    let result = cliParse(['-h'], {
    });
    
    let expected = {
        name: 'help',
        output: help
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: unknown short argument', (t) => {
    let unknown = cliParse.unknown;
    let result = cliParse(['-w'], {
    });
    
    let expected = {
        name: 'unknown',
        output: unknown('w')
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: unknown long argument', (t) => {
    let unknown = cliParse.unknown;
    let result = cliParse(['--world'], {
    });
    
    let expected = {
        name: 'unknown',
        output: unknown('world')
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: script not found', (t) => {
    let scriptNotFound = cliParse.scriptNotFound;
    let result = cliParse(['hello'], {
    });
    
    let expected = {
        name: 'script-not-found',
        output: scriptNotFound({
            _: ['hello'],
            p: [],
            s: []
        })
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    
    t.end();
});

test('cli-parse: deep script not found', (t) => {
    const result = cliParse(['docker'], {
      docker: 'redrun docker:pull:node docker:build docker:push',
      'docker:pull:node': 'echo "docker pull node"'
    });
    
    let expected = {
        calm: false,
        cmd: 'echo One of scripts not found: docker:pull:node docker:build docker:push',
        name: 'run',
        quiet: false
    };
    
    t.deepEqual(result, expected, 'should return object with name and output');
    
    t.end();
});

test('cli-parse: deep scripts are empty', (t) => {
    const result = cliParse(['docker'], {
      docker: 'redrun docker:pull:node docker:build docker:push',
      'docker:pull:node': 'echo "docker pull node"',
      'docker:build': '',
      'docker:push': ''
    });
    
    let expected = {
        calm: false,
        cmd: 'echo "docker pull node"',
        name: 'run',
        quiet: false
    };
    
    t.deepEqual(result, expected, 'should return object with name and output');
    
    t.end();
});
test('cli-parse: args: no scripts', (t) => {
    let fn = () => cliParse([]);
    t.throws(fn, /scripts should be object!/, 'should throw when no scripts');
    t.end();
});

test('cli-parse: args: no', (t) => {
    t.throws(cliParse, /argv should be an array!/, 'should throw when no args');
    t.end();
});

