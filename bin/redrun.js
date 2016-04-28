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
    const spawnify = require('spawnify');
    
    const child = spawnify(cmd, {
        env: getEnv()
    });
    
    child.on('data', (data) => {
        process.stdout.write(data);
    });
    
    child.on('error', (error) => {
        process.stdout.write(error.message);
    });
}

function getEnv() {
    const env = require('../lib/env');
    const path = require('path');
    
    const config = getInfo(cwd).config;
    const assign = Object.assign;
    const PATH = process.env.PATH;
    const CWD = process.cwd();
    
    const envVars = assign(env.config(config), {
        PATH: env.path(PATH, path.delimiter, CWD, path.sep)
    });
    
    return envVars;
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

