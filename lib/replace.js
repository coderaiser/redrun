'use strict';

let argsStr         = '(\\w|\\:|\\s--|$)+';

module.exports = (cmd, fn) => {
    let result = cmd;
    
    result = replaceNpmRun(result, fn);
    result = replaceReserved(result, fn);
    
    return result;
};

function replaceNpmRun(cmd, fn) {
    let str = 'npm run ';
    let reg = RegExp(str + argsStr, 'g');
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace(str, '');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
    
    return result;
}

function replaceReserved(cmd, fn) {
    let str = 'npm ((re)?start|stop|test|publish|(un)?install|version)';
    let reg = RegExp(str + argsStr, 'g');
    let result = cmd.replace(reg, (cmd) => {
        cmd = cmd.replace('npm ', '');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
    
    return result;
}
