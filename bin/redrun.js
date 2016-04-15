#!/usr/bin/env node

'use strict';

let path        = require('path');
let spawnify    = require('spawnify');
let tryCatch    = require('try-catch');
let redrun      = require('..');
let script      = process.argv[2];

exec(redrun(script, getInfo()));

function exec(cmd) {
    let child = spawnify(cmd);
    
    console.log(`redrun: ${cmd}`);
    
    child.on('data', (data) => {
        process.stdout.write(data);
    });
    
    child.on('error', (error) => {
        process.stderr.write(error);
    });
}

function getInfo() {
    let info;
    let infoPath     = path.join(process.cwd(), 'package.json');
    let error       = tryCatch(() => {
        info = require(infoPath);
    });
    
    if (error) {
        console.error(error.message);
        process.exit(1);
    }
    
    return info;
}

