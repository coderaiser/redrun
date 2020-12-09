#!/usr/bin/env node

import path from 'path';
import tryCatch from 'try-catch';
import readjson from 'readjson';

import squad from 'squad';
import mapsome from 'mapsome';
import storage from 'fullstore';
import parentDirs from 'parent-dirs';

import cliParse from '../lib/cli-parse.js';

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
    arg = await cliParse(argv, {});
else
    arg = await cliParse(argv, traverseForInfo(cwd).scripts || {});

if (arg.name !== 'run') {
    console.log(arg.output);
} else {
    if (!arg.quiet)
        console.log(`> ${arg.cmd}`);
    
    if (arg.calm)
        ErrorCode = 0;
    
    await execute(arg.cmd);
}

async function execute(cmd) {
    const {execSync} = await import('child_process');
    const env = await getEnv();
    
    tryOrExit(() => {
        execSync(cmd, {
            env,
            stdio: [0, 1, 2, 'pipe'],
            cwd: Directory(),
        });
    });
}

async function getEnv() {
    const envir = (await import('envir')).default;
    
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

