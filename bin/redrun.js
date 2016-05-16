#!/usr/bin/env node

'use strict';

let path        = require('path');
let tryCatch    = require('try-catch');
let squad       = require('squad');
let cliParse    = require('../lib/cli-parse');
let ErrorCode   = 1;
let tryOrExit   = squad(exitIfError, tryCatch);

let cwd         = process.cwd();
let argv        = process.argv.slice(2);
let first       = argv[0];
let arg;

if (!first|| /^(-v|--version|-h|--help)$/.test(first))
    arg = cliParse(argv, {});
else
    arg = cliParse(argv,  getInfo(cwd).scripts);

if (arg.name !== 'run') {
    console.log(arg.output);
} else {
    if (arg.loud)
        console.log(arg.cmd);
    
    if (arg.calm)
        ErrorCode = 0;
    
    execute(arg.cmd);
}

function execute(cmd) {
    const execSync = require('child_process').execSync;
    
    tryOrExit(() => {
        execSync(cmd, {
            stdio: 'inherit',
            env: getEnv()
        });
    });
}

function getEnv() {
    const env = require('../lib/env');
    const path = require('path');
    
    const config = getInfo(cwd).config;
    const assign = Object.assign;
    
    const CWD = process.cwd();
    const PATH = env.path(process.env.PATH, path.delimiter, CWD, path.sep);
    
    const envVars = assign(process.env, env.config(config), {
        PATH: PATH
    });
    
    return envVars;
}

function exitIfError(error) {
    if (error) {
        console.error(error.message);
        process.exit(ErrorCode);
    }
}

function getInfo(dir) {
    let info;
    let infoPath = path.join(dir, 'package.json');
    
    tryOrExit(() => {
        info = require(infoPath);
    });
    
    return info;
}

