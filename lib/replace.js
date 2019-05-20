'use strict';

const regexp = require('./regexp');
const log = require('debug')('redrun:replace');

module.exports = (result, fn) => {
    result = replaceNpmRun(result, fn);
    result = replaceReserved(result, fn);
    result = replaceReservedTest(result, fn);
    result = replaceRedrun(result, fn);
    result = replaceMadrun(result, fn);
    
    return result;
};

function replaceNpmRun(cmd, fn) {
    const str = 'npm run ';
    const reg = regexp.arg;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(str, '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReserved(cmd, fn) {
    const reg = regexp.reserved;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace('npm ', '');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceReservedTest(cmd, fn) {
    const reg = regexp.reservedTest;
    const result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(reg, 'test');
        return fn('npm', cmd);
    });
    
    return result;
}

function replaceRedrun(cmd, fn) {
    const reg = regexp.redrun;
    const regEnd = regexp.redrunEnd;
    
    log(`replaceRedrun: ${reg.test(cmd)} "${cmd}"`);
    const result = cmd.replace(reg, (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/(npx\s)?redrun\s?/, '');
        log(`2) ${cmd}`);
        
        const regEndMatch = cmd.match(regEnd);
        const ending = !regEndMatch ? '' : regEndMatch[0];
        
        cmd = cmd.replace(regEnd, '');
        cmd = fn('redrun', cmd) + ending;
        
        return cmd;
    });
    
    return result;
}

function replaceMadrun(cmd, fn) {
    const reg = regexp.madrun;
    const regEnd = regexp.redrunEnd;
    
    log(`replaceMadrun: ${reg.test(cmd)} "${cmd}"`);
    const result = cmd.replace(reg, (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/(npx\s)?madrun\s?/, '');
        log(`2) ${cmd}`);
        
        const regEndMatch = cmd.match(regEnd);
        const ending = !regEndMatch ? '' : regEndMatch[0];
        
        cmd = cmd.replace(regEnd, '');
        cmd = fn('madrun', cmd) + ending;
        
        return cmd;
    });
    
    return result;
}

