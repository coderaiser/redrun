#!/usr/bin/env node

'use strict';

const path = require('path');
const tryCatch = require('try-catch');
const squad = require('squad');
const readjson = require('readjson');

const mapsome = require('mapsome/legacy');
const storage = require('fullstore/legacy');

const cliParse = require('../lib/cli-parse');
const cwd = process.cwd();
const argv = process.argv.slice(2);
const first = argv[0];

const Directory = storage();
const Info = storage();

const tryOrExit = squad(exitIfError, tryCatch);
const exitIfNotEntry = squad(exitIfError, notEntryError);

let arg;
let ErrorCode = 1;

if (!first|| /^(-v|--version|-h|--help)$/.test(first))
    arg = cliParse(argv, {});
else
    arg = cliParse(argv,  traverseForInfo(cwd).scripts || {});

if (arg.name !== 'run') {
    console.log(arg.output);
} else {
    if (!arg.quiet)
        console.log(`> ${arg.cmd}`);
    
    if (arg.calm)
        ErrorCode = 0;
    
    execute(arg.cmd);
}

function execute(cmd) {
    const execSync = require('child_process').execSync;
    
    tryOrExit(() => {
        execSync(cmd, {
            stdio: [0, 1, 2, 'pipe'],
            env: getEnv(),
            cwd: Directory()
        });
    });
}

function getEnv() {
    const env = require('../lib/env');
    const path = require('path');
    
    const dir = Directory();
    const info = Info();
    const config = info.config;
    
    const PATH = env.path(process.env.PATH, path.delimiter, dir, path.sep);
    
    const envVars = Object.assign({}, process.env, env.config(config), {
        PATH,
        npm_package_version: info.version,
    });
    
    return envVars;
}

function exitIfError(error) {
    if (error) {
        console.error(error.message);
        process.exit(ErrorCode);
    }
    
    return error;
}

function getInfo(dir) {
    let info;
    const infoPath = path.join(dir, 'package.json');
    
    const error = tryCatch(() => {
        info = readjson.sync(infoPath);
        
        Info(info);
        Directory(dir);
    });
    
    exitIfNotEntry(infoPath, error);
    
    return info;
}

function traverseForInfo(cwd) {
    const result = mapsome((dir) => {
        return getInfo(dir);
    }, parentDirs(cwd));
    
    exitIfEntryError(result);
    
    return result;
}

function notEntryError(path, error) {
    if (error && error.code !== 'ENOENT') {
        const message = error.message;
        error.message = `${path}: ${message}`;
        
        return error;
    }
}

function exitIfEntryError(data) {
    if (!data) {
        const infoPath = path.join(cwd, 'package.json');
        const error = Error(`Cannot find module '${infoPath}'`);
        exitIfError(error);
    }
}

// npm parent-dirs in es2015 only
function parentDirs(str) {
    const pth = str || process.cwd();
    
    if (pth === '/') {
        return ['/'];
    }
    
    const parts = pth.split(/[/\\]/);
    
    return parts.map((el, i) => {
        return parts
            .slice(0, parts.length - i)
            .join('/')
            .replace(/^$/, '/');
    });
}

