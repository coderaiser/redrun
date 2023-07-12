'use strict';

const replaceAsync = require('string-replace-async');
const regexp = require('./regexp');
const log = require('debug')('redrun:replace');

module.exports = async (result, fn) => {
    result = await replaceNpmRun(result, fn);
    result = await replaceReserved(result, fn);
    result = await replaceReservedTest(result, fn);
    result = await replaceRedrun(result, fn);
    result = await replaceMadrun(result, fn);
    
    return result;
};

async function replaceNpmRun(cmd, fn) {
    const str = 'npm run ';
    const reg = regexp.arg;
    const result = await replaceAsync(cmd, reg, async (cmd) => {
        cmd = cmd.replace(str, '');
        return await fn('npm', cmd);
    });
    
    return result;
}

async function replaceReserved(cmd, fn) {
    const reg = regexp.reserved;
    const result = await replaceAsync(cmd, reg, async (cmd) => {
        cmd = cmd.replace('npm ', '');
        return await fn('npm', cmd);
    });
    
    return result;
}

async function replaceReservedTest(cmd, fn) {
    const reg = regexp.reservedTest;
    const result = await replaceAsync(cmd, reg, async (cmd) => {
        cmd = cmd.replace(reg, 'test');
        return await fn('npm', cmd);
    });
    
    return result;
}

async function replaceRedrun(cmd, fn) {
    const reg = regexp.redrun;
    const regEnd = regexp.redrunEnd;
    
    log(`replaceRedrun: ${reg.test(cmd)} "${cmd}"`);
    const result = await replaceAsync(cmd, reg, async (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/(npx\s)?redrun\s?/, '');
        log(`2) ${cmd}`);
        
        const regEndMatch = cmd.match(regEnd);
        const ending = !regEndMatch ? '' : regEndMatch[0];
        
        cmd = cmd.replace(regEnd, '');
        cmd = await fn('redrun', cmd) + ending;
        
        return cmd;
    });
    
    return result;
}

async function replaceMadrun(cmd, fn) {
    const reg = regexp.madrun;
    
    log(`replaceMadrun: ${reg.test(cmd)} "${cmd}"`);
    const result = await replaceAsync(cmd, reg, async (cmd) => {
        log(`1) ${cmd}`);
        cmd = cmd.replace(/(npx\s)?madrun\s?/, '');
        
        log(`2) ${cmd}`);
        cmd = await fn('madrun', cmd);
        
        return cmd;
    });
    
    return result;
}
