#!/usr/bin/env node

import {statSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {execSync} from 'node:child_process';
import {tryCatch} from 'try-catch';
import readjson from 'readjson';
import squad from 'squad';
import mapsome from 'mapsome';
import storage from 'fullstore';
import parentDirectories from 'parent-directories';
import envir from 'envir';
import cliParse from '../lib/cli-parse.js';

const cwd = process.cwd();
const argv = process.argv.slice(2);
const [first] = argv;

const Directory = storage();
const InfoDirectory = storage();
const Info = storage();
const pop = ([a]) => a;

const tryOrExit = squad(exitIfError, pop, tryCatch);
const exitIfNotEntry = squad(exitIfError, notEntryError);

let arg;
let ErrorCode = 1;

if (!first || /^(-v|--version|-h|--help)$/.test(first)) {
    arg = await cliParse(argv, {});
} else {
    const info = traverseForInfo(cwd).scripts || {};
    nodeModulesDir(cwd);
    arg = await cliParse(argv, info);
}

if (arg.name !== 'run') {
    console.log(arg.output);
    process.exit(ErrorCode);
} else {
    if (!arg.quiet)
        console.log(`> ${arg.cmd}`);
    
    if (arg.calm)
        ErrorCode = 0;
    
    execute(arg.cmd);
}

function execute(cmd) {
    const env = getEnv();
    
    tryOrExit(() => {
        execSync(cmd, {
            env,
            stdio: [
                0,
                1,
                2,
                'pipe',
            ],
            cwd: InfoDirectory(),
        });
    });
}

function getEnv() {
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
    const [error, info] = tryCatch(readjson.sync, infoPath);
    
    exitIfNotEntry(infoPath, error);
    
    Info(info);
    InfoDirectory(dir);
    
    return info;
}

function nodeModulesDir(cwd) {
    for (const dir of parentDirectories(cwd)) {
        const nodeModulesPath = path.join(dir, 'node_modules');
        const [error] = tryCatch(statSync, nodeModulesPath);
        
        if (!error) {
            Directory(dir);
            return;
        }
    }
}

function traverseForInfo(cwd) {
    const result = mapsome(getInfo, parentDirectories(cwd));
    
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
