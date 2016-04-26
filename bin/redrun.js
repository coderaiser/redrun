#!/usr/bin/env node

'use strict';

let path        = require('path');
let tryCatch    = require('try-catch');
let cliParse    = require('../lib/cli-parse');
let cwd         = process.cwd();
let argv        = process.argv;
let arg         = cliParse(argv.slice(2),  getInfo(cwd).scripts);

if (arg.loud || arg.name !== 'run')
    console.log(arg.output);
else if (arg.name === 'run')
   execute(arg.cmd);

function execute(cmd) {
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

