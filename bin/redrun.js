#!/usr/bin/env node

'use strict';

let path        = require('path');
let spawnify    = require('spawnify');
let tryCatch    = require('try-catch');
let redrun      = require('..');
let cwd         = process.cwd();
let argv        = process.argv;
let args        = require('minimist')(argv.slice(2), {
    alias: {
        string: [
            'parallel',
            'series'
        ],
        boolean: [
            'loud',
            'help',
            'version'
        ],
        p: 'parallel',
        s: 'series',
        l: 'loud',
        h: 'help',
        v: 'version'
    },
    
    unknown: function(cmd) {
        let name = getInfo('..').name;
        
        if (/^--?/.test(cmd)) {
            console.error(
                '\'%s\' is not a ' +  name + ' option. ' +
                'See \'' + name + ' --help\'.', cmd
            );
          
            process.exit(-1);
        }
    }
});

if (args.version) {
    version();
} else if (args.help || !args._.length && !args.parallel && !args.series) {
    help();
} else {
    let cmd = '';
    
    if (args.parallel)
        cmd = parallel(array(args.parallel), getInfo(cwd));
   
   let seriesScripts = [...args._, ...array(args.series)];
   
   if (seriesScripts.length) {
        if (cmd) {
            cmd += ' && ';
        }
        
        cmd += series(seriesScripts, getInfo(cwd));
   }
   
    if (!cmd) {
        console.error('script not found!');
        process.exit(1);
    }
    
    if (args.loud)
        console.log(`redrun: ${cmd}`);
    
   execute(cmd);
}

function series(names, scripts) {
    let all = names.map((name) => {
        return redrun(name, scripts);
    });
    
    return all.join(' && ');
}

function parallel(names, scripts) {
    let all = names.map((name) => {
        return redrun(name, {parallel: true}, scripts);
    });
    
    return all.join(' & ');
}

function execute(cmd) {
    let child = spawnify(cmd);
    
    child.on('data', (data) => {
        process.stdout.write(data);
    });
    
    child.on('error', (error) => {
        console.error(error.message);
    });
}

function getInfo(dir) {
    let info;
    let infoPath     = path.join(dir, 'package.json');
    let error       = tryCatch(() => {
        info = require(infoPath);
    });
    
    if (error) {
        console.error(error.message);
        process.exit(1);
    }
    
    return info;
}

function version() {
    console.log('v' + getInfo('..').version);
}

function help() {
    var bin         = require('../help'),
        usage       = 'Usage: ' + getInfo('..').name + ' [script1 script2 ... scriptN]';
        
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach(function(name) {
        var line = '  ' + name + ' ' + bin[name];
        console.log(line);
    });
}

function array(value) {
    if (!value)
        return [];
    
    if (!Array.isArray(value))
        return [value];
    
    return value;
}
