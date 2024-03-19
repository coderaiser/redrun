import {createRequire} from 'node:module';
import debug from 'debug';
import os from 'node:os';
import yargsParser from 'yargs-parser';
import * as regexp from './regexp.js';
import forEachKey from 'for-each-key';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const helpjson = require('../help.json');
const log = debug('redrun:cli-parse');

const {assign} = Object;

export default async function cliParse(argv, scripts) {
    log(`argv: ${argv}`);
    
    check(argv, scripts);
    
    const getArguments = (index, argv) => !~index ? '' : ' ' + argv
        .slice(index + 1)
        .join(' ');
    
    const cutArguments = (index, argv) => !~index ? argv : argv.slice(0, index);
    
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
        const cmd = await parse(args, params, scripts);
        
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
}

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

export function version() {
    return 'v' + pkg.version;
}

export function help() {
    let result = 'Usage: ' + pkg.name + ' [...tasks] [options] [-- ...args]\n';
    
    result += 'Options:\n';
    
    const addStr = (key, value) => {
        result += `  ${key} ${value}\n`;
    };
    
    forEachKey(addStr, helpjson);
    
    return result;
}

export function unknown(cmd) {
    if (cmd.length === 1)
        cmd = `-${cmd}`;
    else
        cmd = `--${cmd}`;
    
    const {name} = pkg;
    
    return `${cmd} is not a ${name} option. ` + `See '${name}  --help'`;
}

assign(cliParse, {
    unknown,
    help,
    version,
});

export function scriptNotFound(argv) {
    const {s, p} = argv;
    const argStr = argv
        ._
        .concat(s, p)
        .join(' ');
    
    return `One of scripts not found: ${argStr}`;
}

async function parse(args, params, scripts) {
    let cmd = '';
    const and = (cmd) => cmd && ` && ${cmd}`;
    const calmDown = (array) => array.map((name) => {
        return `${name} || ${calm()}`;
    });
    
    const calmIf = (array) => !args.calm ? array : calmDown(array);
    
    if (args.parallel.length)
        cmd = await parallel(args.parallel, params, scripts);
    
    if (args.parallelCalm.length) {
        const parallelCalm = calmDown(args.parallelCalm);
        cmd = await parallel(parallelCalm, params, scripts) + and(cmd);
    }
    
    if (args.seriesCalm.length) {
        const seriesCalm = calmDown(args.seriesCalm);
        cmd = await series(seriesCalm, params, scripts) + and(cmd);
    }
    
    const names = calmIf(args._).concat(args.series);
    
    if (names.length)
        cmd = await series(names, params, scripts) + and(cmd);
    
    return cmd;
}

function calm() {
    const platform = os.platform();
    const isWin = platform === 'win32';
    
    return isWin ? '(exit 0)' : 'true';
}

async function series(names, params, scripts) {
    const {default: groupParse} = await import('./group-parse.js');
    return await groupParse(names, {params}, scripts);
}

async function parallel(names, params, scripts) {
    const {default: groupParse} = await import('./group-parse.js');
    return await groupParse(names, {params, parallel: true}, scripts);
}
