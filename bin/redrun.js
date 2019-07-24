#!/usr/bin/env node

'use strict';

const path = require('path');
const tryCatch = require('try-catch');
const readjson = require('readjson');

const squad = require('squad');
const mapsome = require('mapsome');
const storage = require('fullstore');
const parentDirs = require('parent-dirs');

const cliParse = require('../lib/cli-parse');
const cwd = process.cwd();
const argv = process.argv.slice(2);
const [first] = argv;

const Directory = storage();
const Info = storage();
const pop = (a) => a[0];

const tryOrExit = squad(exitIfError, pop, tryCatch);
const exitIfNotEntry = squad(exitIfError, notEntryError);

let arg;
let ErrorCode = 1;

if (!first || /^(-v|--version|-h|--help)$/.test(first))
    arg = cliParse(argv, {});
else
    arg = cliParse(argv, traverseForInfo(cwd).scripts || {});

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
    const {execSync} = require('child_process');
    
    tryOrExit(() => {
        execSync(cmd, {
            stdio: [0, 1, 2, 'pipe'],
            env: getEnv(),
            cwd: Directory(),
        });
    });
}

function getEnv() {
    const envir = require('envir');
    
    const dir = Directory();
    const info = Info();
    
    const {PATH} = process.env;
    const env = envir(PATH, dir, info);
    
    return {
        ...process.env,
        ...env,
    };
}

function exitIfError(error) {
    if (error) {
        console.error(error.message);
        process.exit(ErrorCode);
    }
    
    return error;
}

function getInfo(dir) {
    const infoPath = path.join(dir, 'package.json');
    
    const result = tryCatch(readjson.sync, infoPath);
    const [error] = result;
    const info = result[1];
    
    exitIfNotEntry(infoPath, error);
    
    Info(info);
    Directory(dir);
    
    return info;
}

function traverseForInfo(cwd) {
    const result = mapsome(getInfo, parentDirs(cwd));
    
    exitIfEntryError(result);
    
    return result;
}

function notEntryError(path, error) {
    if (error && error.code !== 'ENOENT') {
        const {message} = error;
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

