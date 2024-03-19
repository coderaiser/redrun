import os from 'node:os';
import test from 'supertape';
import tryToCatch from 'try-to-catch';
import cliParse from '../lib/cli-parse.js';

test('cli-parse: series', async (t) => {
    const result = await cliParse(['--series', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls && pwd',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    t.end();
});

test('cli-parse: parallel', async (t) => {
    const result = await cliParse(['--parallel', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls & pwd',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    t.end();
});

test('cli-parse: parallel --quiet', async (t) => {
    const result = await cliParse([
        '--parallel',
        'one',
        'two',
        '--quiet',
    ], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls & pwd',
        quiet: true,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    t.end();
});

test('cli-parse: parallel: before script', async (t) => {
    const result = await cliParse([
        'main',
        '--parallel',
        'one',
        'two',
    ], {
        one: 'ls',
        two: 'pwd',
        main: 'echo hi',
    });
    
    const expected = {
        name: 'run',
        cmd: 'echo hi && ls & pwd',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    t.end();
});

test('cli-parse: series and parallel', async (t) => {
    const result = await cliParse([
        '--s',
        'one',
        'two',
        '-p',
        'three',
        'four',
    ], {
        one: 'ls',
        two: 'pwd',
        three: 'whoami',
        four: 'ps aux',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls && pwd && whoami & ps aux',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object');
    t.end();
});

test('cli-parse: series calm: linux', async (t) => {
    const {platform} = os;
    
    os.platform = () => 'linux';
    
    const result = await cliParse(['--series-calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls || true && pwd || true',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "true"');
    
    os.platform = platform;
    
    t.end();
});

test('cli-parse: parallel calm: windows', async (t) => {
    const {platform} = os;
    
    os.platform = () => 'win32';
    
    const result = await cliParse(['--parallel-calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls || (exit 0) & pwd || (exit 0)',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "exit 0"');
    
    os.platform = platform;
    
    t.end();
});

test('cli-parse: --calm: linux', async (t) => {
    const {platform} = os;
    
    os.platform = () => 'linux';
    
    const result = await cliParse(['--calm', 'one', 'two'], {
        one: 'ls',
        two: 'pwd',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls || true && pwd || true',
        quiet: false,
        calm: true,
    };
    
    t.deepEqual(result, expected, 'should build cmd object with "exit 0"');
    
    os.platform = platform;
    
    t.end();
});

test('cli-parse: scripts arguments: *', async (t) => {
    const result = await cliParse([
        'o*',
        '--',
        '--parallel',
        'three',
        'four',
    ], {
        'one:ls': 'ls',
        'one:ps': 'ps',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls --parallel three four && ps --parallel three four',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object that contains arguments');
    t.end();
});

test('cli-parse: scripts arguments: simple', async (t) => {
    const result = await cliParse(['one', '--', '--fix'], {
        'one': 'redrun one:*',
        'one:ls': 'ls',
        'one:ps': 'ps',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls && ps "--fix"',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object that contains arguments');
    t.end();
});

test('cli-parse: scripts arguments: parallel', async (t) => {
    const result = await cliParse([
        'o*',
        '--',
        '--parallel',
        'three',
        'four',
    ], {
        one: 'ls',
        on: 'who',
    });
    
    const expected = {
        name: 'run',
        cmd: 'ls --parallel three four && who --parallel three four',
        quiet: false,
        calm: false,
    };
    
    t.deepEqual(result, expected, 'should build cmd object that contains arguments');
    t.end();
});

test('cli-parse: --version', async (t) => {
    const output = await cliParse.version();
    const result = await cliParse(['--version'], {});
    
    const expected = {
        name: 'version',
        output,
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: -v', async (t) => {
    const output = await cliParse.version();
    const result = await cliParse(['-v'], {});
    
    const expected = {
        name: 'version',
        output,
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: --help', async (t) => {
    const output = await cliParse.help();
    const result = await cliParse(['--help'], {});
    
    const expected = {
        name: 'help',
        output,
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: -h', async (t) => {
    const output = await cliParse.help();
    const result = await cliParse(['-h'], {});
    
    const expected = {
        name: 'help',
        output,
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: unknown short argument', async (t) => {
    const {unknown} = await cliParse;
    const result = await cliParse(['-w'], {});
    
    const expected = {
        name: 'unknown',
        output: unknown('w'),
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: unknown long argument', async (t) => {
    const {unknown} = await cliParse;
    const result = await cliParse(['--world'], {});
    
    const expected = {
        name: 'unknown',
        output: unknown('world'),
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: script not found', async (t) => {
    const result = await cliParse(['hello'], {
        hello: 'npm run world',
    });
    
    const expected = {
        name: 'run',
        quiet: false,
        calm: false,
        cmd: 'echo One of scripts not found: world',
    };
    
    t.deepEqual(result, expected, 'should return object with name, output and cmd');
    t.end();
});

test('cli-parse: deep script not found', async (t) => {
    const result = await cliParse(['docker'], {
        'docker': 'redrun docker:pull:node docker:build docker:push',
        'docker:pull:node': 'echo "docker pull node"',
    });
    
    const expected = {
        calm: false,
        cmd: 'echo One of scripts not found: docker:pull:node docker:build docker:push',
        name: 'run',
        quiet: false,
    };
    
    t.deepEqual(result, expected, 'should return object with name and output');
    t.end();
});

test('cli-parse: deep scripts are empty', async (t) => {
    const result = await cliParse(['docker'], {
        'docker': 'redrun docker:pull:node docker:build docker:push',
        'docker:pull:node': 'echo "docker pull node"',
        'docker:build': '',
        'docker:push': '',
    });
    
    const expected = {
        calm: false,
        cmd: 'echo "docker pull node"',
        name: 'run',
        quiet: false,
    };
    
    t.deepEqual(result, expected, 'should return object with name and output');
    t.end();
});

test('cli-parse: args: no scripts', async (t) => {
    const [e] = await tryToCatch(cliParse, []);
    
    t.equal(e.message, 'scripts should be object!', 'should throw when no args');
    t.end();
});

test('cli-parse: args: no', async (t) => {
    const [e] = await tryToCatch(cliParse);
    
    t.equal(e.message, 'argv should be an array!', 'should throw when no args');
    t.end();
});
