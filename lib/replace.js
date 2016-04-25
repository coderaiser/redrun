'use strict';

let regexp  = require('./regexp');

module.exports = (cmd, fn) => {
    let result = cmd;
    
    result = replaceNpmRun(result, fn);
    result = replaceReserved(result, fn);
    result = replaceReservedTest(result, fn);
    
    return result;
};

function replaceNpmRun(cmd, fn) {
    let str = 'npm run ';
    let reg = regexp.arg;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(str, '');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
    
    return result;
}

function replaceReserved(cmd, fn) {
    let reg = regexp.reserved;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace('npm ', '');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
    
    return result;
}

function replaceReservedTest(cmd, fn) {
    let reg = regexp.reservedTest;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(reg, 'test');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
    
    return result;
}

