'use strict';

const regexp  = require('./regexp');
const quote = require('./quote-args');
const log = require('debug')('redrun:replace');

module.exports = (cmd, fn) => {
    let result = cmd;
    
    result = replaceNpmRun(result, fn);
    result = replaceReserved(result, fn);
    result = replaceReservedTest(result, fn);
    result = replaceRedrun(result, fn);
    
    return result;
};

function replaceNpmRun(cmd, fn) {
    const str = 'npm run ';
    const reg = regexp.arg;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(str, '');
        cmd = quote(cmd);
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReserved(cmd, fn) {
    const reg = regexp.reserved;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace('npm ', '');
        cmd = cmd.replace(' --', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReservedTest(cmd, fn) {
    const reg = regexp.reservedTest;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(reg, 'test');
        cmd = cmd.replace(' --', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceRedrun(cmd, fn) {
    const reg = regexp.redrun;
    const regEnd = regexp.redrunEnd;
    
    log(`replaceRedrun: ${reg.test(cmd)} "${cmd}"`);
    cmd = quote(cmd);
    const result = cmd.replace(reg, (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/redrun\s?/, '');
        log(`2) ${cmd}`);
        
        const regEndMatch = cmd.match(regEnd);
        const ending = !regEndMatch ? '' : regEndMatch[0];
        
        cmd = cmd.replace(regEnd, '');
        cmd = fn('redrun', cmd) + ending;
        
        return cmd;
    });
    
    return result;
}

