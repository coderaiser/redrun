'use strict';

const os = require('os');
const yargs = require('yargs');
const log = require('debug')('redrun:cli-parse');
const pkg = require('../package');
const helpjson = require('../help');
const regexp = require('./regexp');

const argsParser = getArgsParser();

module.exports = (argv, scripts, fn) => {
    log(`argv: ${argv}`);
    
    check(argv, scripts, fn);
    
    const getArguments = (index, argv) => {
        return !~index ? '' : ' ' + argv.slice(index + 1).join(' ');
    };
    
    const cutArguments = (index, argv) => {
        return !~index ? argv : argv.slice(0, index);
    };
    
    const indexOfParams = argv.indexOf('--');
    const params = getArguments(indexOfParams, argv);
    
    argv = cutArguments(indexOfParams, argv);
    
    const args = argsParser(argv);
    let result;
    
    const unknownName = findUnknown(args);
    
    if (unknownName) {
        result = build('unknown', unknown, unknownName);
    } else  if (args.version) {
        result = build('version', version);
    } else if (args.help || !args._.concat(args.parallel, args.series, args.parallelCalm, args.seriesCalm).length) {
        result = build('help', help);
    } else {
        const cmd = parse(args, scripts);
        
        if (!cmd)
            result = build('script-not-found', scriptNotFound, args);
        else
            result = {
                name: 'run',
                quiet: args.quiet,
                calm: args.calm,
                cmd: `${cmd}${params}`
            };
    }
    
    log(`result: ${result.cmd || result.output}`);
    
    return result;
};

function build(name, fn, arg) {
    return {
        name: name,
        output: fn(arg)
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
    const name = keys.filter((a) => {
        return !argsRegExp.test(a);
    })[0];
    
    return name;
}

function getArgsParser() {
    const parser = yargs
        .showHelpOnFail(false)
        .option('p', {
            alias: 'parallel',
            type: 'array',
            default: [],
            description: 'run scripts in parallel'
        })
        .option('s', {
            alias: 'series',
            type: 'array',
            default: [],
            description: 'run scripts in series'
        })
        .option('q', {
            alias: 'quiet',
            type: 'boolean',
            description: 'do not output result comand before execution'
        })
        .option('c', {
            alias: 'calm',
            type: 'boolean',
            description: 'return zero exit code when command compconsted with error'
        })
        .option('P', {
            alias: 'parallel-calm',
            type: 'array',
            default: [],
            description: 'run scripts in parallel and return zero exit code'
        })
        .option('S', {
            alias: 'series-calm',
            type: 'array',
            default: [],
            description: 'run scripts in series and return zero exit code'
        })
        .option('v', {
            alias: 'version',
            type: 'boolean',
            description: 'output version information and exit'
        })
        .option('h', {
            alias: 'help',
            type: 'boolean',
            description: 'display this help and exit'
        });
        
        return parser.parse;
}

function version() {
    return 'v' + pkg.version;
}

function help() {
    const usage = 'Usage: ' + pkg.name + ' [...tasks] [options] [-- ...args]';
    let result = `${usage}\n`;
    result += 'Options:\n';
    
    result += Object.keys(helpjson).map((name) => {
        return `  ${name} ${helpjson[name]}`;
    }).join('\n');
    
    return result;
}

function unknown(cmd) {
    if (cmd.length === 1)
        cmd = '-' + cmd;
    else
        cmd = '--' + cmd;
    
    const name    = pkg.name;
    const result  = `${cmd} is not a ${name} option. ` +
         `See '${name}  --help'`;
    
    return result;
}

function scriptNotFound(argv) {
    const argStr = argv._.concat(argv.s, argv.p).join(' ');
    const result = `One of scripts not found: ${argStr}`;
    
    return result;
}

function parse(args, scripts) {
    let cmd = '';
    const and = (cmd) => cmd && `${cmd} && `;
    const calmDown = (array) => array.map((name) => {
        return `${name} || ${calm()}`;
    });
    
    const calmIf = (array) => {
        return !args.calm ? array : calmDown(array);
    };
    
    if (args.parallel.length)
        cmd = parallel(args.parallel, scripts);
   
    if (args.parallelCalm.length) {
        const parallelCalm = calmDown(args.parallelCalm);
        cmd = and(cmd) + parallel(parallelCalm, scripts);
    }
    
    if (args.seriesCalm.length) {
        const seriesCalm = calmDown(args.seriesCalm);
        cmd = and(cmd) + series(seriesCalm, scripts);
    }
    
    const names = calmIf(args._).concat(args.series);
   
    if (names.length) {
        cmd = and(cmd) + series(names, scripts);
    }
    
    return cmd;
}

function calm() {
    const platform = os.platform();
    const isWin = platform === 'win32';
    const cmd = isWin ? '(exit 0)' : 'true';
    
    return cmd;
}

function series(names, scripts) {
    const groupParse = require('./group-parse');
    
    return groupParse(names, scripts);
}

function parallel(names, scripts) {
    const groupParse = require('./group-parse');
    
    return groupParse(names, {parallel: true}, scripts);
}

