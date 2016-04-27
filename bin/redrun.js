#!/usr/bin/env node

'use strict';

let path        = require('path');
let tryCatch    = require('try-catch');
let cliParse    = require('../lib/cli-parse');
let cwd         = process.cwd();
let argv        = process.argv;
let arg         = cliParse(argv.slice(2),  getInfo(cwd).scripts);

if (arg.name !== 'run') {
    console.log(arg.output);
} else if (arg.name === 'run') {
    if (arg.loud)
        console.log(arg.cmd);
    
    execute(arg.cmd);
}

function execute(cmd) {
    require('../lib/env')();
    let spawnify = require('spawnify');
    
    let child = spawnify(cmd);
    
    child.on('data', (data) => {
        process.stdout.write(data);
    });
    
    child.on('error', (error) => {
        process.stdout.write(error.message);
    });
}

function getInfo(dir) {
    let info;
    let infoPath = path.join(dir, 'package.json');
    let error = tryCatch(() => {
        info = require(infoPath);
    });
    
    if (error) {
        console.error(error.message);
        process.exit(1);
    }
    
    return info;
}

