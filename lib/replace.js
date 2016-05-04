'use strict';

let regexp  = require('./regexp');
let log = require('debug')('redrun:replace');

module.exports = (cmd, fn) => {
    let result = cmd;
    
    result = replaceNpmRun(result, fn);
    result = replaceReserved(result, fn);
    result = replaceReservedTest(result, fn);
    result = replaceRedrun(result, fn);
    
    return result;
};

function replaceNpmRun(cmd, fn) {
    let str = 'npm run ';
    let reg = regexp.arg;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(str, '');
        cmd = cmd.replace(' --', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReserved(cmd, fn) {
    let reg = regexp.reserved;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace('npm ', '');
        cmd = cmd.replace(' --', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReservedTest(cmd, fn) {
    let reg = regexp.reservedTest;
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(reg, 'test');
        cmd = cmd.replace(' --', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceRedrun(cmd, fn) {
    let reg = regexp.redrun;
    let regEnd = regexp.redrunEnd;
    
    log(`replaceRedrun: ${reg.test(cmd)} "${cmd}"`);
    let result = cmd.replace(reg, (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/redrun\s?/, '');
        log(`2) ${cmd}`);
        
        let regEndMatch = cmd.match(regEnd);
        let ending = !regEndMatch ? '' : regEndMatch[0];
        
        cmd = cmd.replace(regEnd, '');
        cmd = fn('redrun', cmd) + ending;
        
        return cmd;
    });
    
    return result;
}
