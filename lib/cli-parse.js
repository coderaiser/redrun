'use strict';

const os = require('os');
const yargsParser = require('yargs-parser');
const log = require('debug')('redrun:cli-parse');
const pkg = require('../package');
const helpjson = require('../help');
const regexp = require('./regexp');
const forEachKey = require('for-each-key');

module.exports = (argv, scripts) => {
    log(`argv: ${argv}`);
    
    check(argv, scripts);
    
    const getArguments = (index, argv) => {
        return !~index ? '' : ' ' + argv.slice(index + 1).join(' ');
    };
    
    const cutArguments = (index, argv) => {
        return !~index ? argv : argv.slice(0, index);
    };
    
    const indexOfParams = argv.indexOf('--');
    const params = getArguments(indexOfParams, argv);
    
    argv = cutArguments(indexOfParams, argv);
    
    const args = parseArgs(argv);
    
    let result;
    
    const unknownName = findUnknown(args);
    
    if (unknownName) {
        result = build('unknown', unknown, unknownName);
    } else if (args.version) {
        result = build('version', version);
    } else if (args.help || !args._.concat(args.parallel, args.series, args.parallelCalm, args.seriesCalm).length) {
        result = build('help', help);
    } else {
        const cmd = parse(args, params, scripts);
        
        if (!cmd)
            result = build('script-not-found', scriptNotFound, args);
        else
            result = {
                name: 'run',
                quiet: args.quiet,
                calm: args.calm,
                cmd,
            };
    }
    
    log(`result: ${result.cmd || result.output}`);
    
    return result;
};

function parseArgs(args) {
    return yargsParser(args, {
        array: [
            'series',
            'parallel',
            'series-calm',
            'parallel-calm',
        ],
        boolean: [
            'version',
            'help',
            'quiet',
            'calm',
        ],
        alias: {
            s: 'series',
            p: 'parallel',
            S: 'series-calm',
            P: 'parallel-calm',
            v: 'version',
            h: 'help',
            q: 'quiet',
            c: 'calm',
        },
        default: {
            'series': [],
            'parallel': [],
            'parallel-calm': [],
            'series-calm': [],
            'version': false,
            'help': false,
            'quiet': false,
            'calm': false,
        },
    });
}

function build(name, fn, arg) {
    return {
        name,
        output: fn(arg),
    };
}

module.exports.help = help;
module.exports.version = version;
module.exports.unknown = unknown;
module.exports.scriptNotFound = scriptNotFound;

function check(argv, scripts) {
    if (!argv)
        throw Error('argv should be an array!');
    
    if (!scripts)
        throw Error('scripts should be object!');
}

function findUnknown(args) {
    const argsRegExp = regexp.cli;
    const keys = Object.keys(args);
    const test = (a) => !argsRegExp.test(a);
    
    return keys
        .filter(test)
        .pop();
}

function version() {
    return 'v' + pkg.version;
}

function help() {
    let result = 'Usage: ' + pkg.name + ' [...tasks] [options] [-- ...args]\n';
    result += 'Options:\n';
    
    const addStr = (key, value) => {
        result += `  ${key} ${value}\n`;
    };
    
    forEachKey(addStr, helpjson);
    
    return result;
}

function unknown(cmd) {
    if (cmd.length === 1)
        cmd = '-' + cmd;
    else
        cmd = '--' + cmd;
    
    const {name} = pkg;
    const result =
        `${cmd} is not a ${name} option. ` +
        `See '${name}  --help'`;
    
    return result;
}

function scriptNotFound(argv) {
    const argStr = argv._.concat(argv.s, argv.p).join(' ');
    const result = `One of scripts not found: ${argStr}`;
    
    return result;
}

function parse(args, params, scripts) {
    let cmd = '';
    const and = (cmd) => cmd && ` && ${cmd}`;
    const calmDown = (array) => array.map((name) => {
        return `${name} || ${calm()}`;
    });
    
    const calmIf = (array) => {
        return !args.calm ? array : calmDown(array);
    };
    
    if (args.parallel.length)
        cmd = parallel(args.parallel, params, scripts);
    
    if (args.parallelCalm.length) {
        const parallelCalm = calmDown(args.parallelCalm);
        cmd = parallel(parallelCalm, params, scripts) + and(cmd);
    }
    
    if (args.seriesCalm.length) {
        const seriesCalm = calmDown(args.seriesCalm);
        cmd = series(seriesCalm, params, scripts) + and(cmd);
    }
    
    const names = calmIf(args._).concat(args.series);
    
    if (names.length)
        cmd = series(names, params, scripts) + and(cmd);
    
    return cmd;
}

function calm() {
    const platform = os.platform();
    const isWin = platform === 'win32';
    const cmd = isWin ? '(exit 0)' : 'true';
    
    return cmd;
}

function series(names, params, scripts) {
    const groupParse = require('./group-parse');
    
    return groupParse(names, {params}, scripts);
}

function parallel(names, params, scripts) {
    const groupParse = require('./group-parse');
    
    return groupParse(names, {params, parallel: true}, scripts);
}

