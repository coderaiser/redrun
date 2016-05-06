'use strict';

let run = 'run(-script)?';
let scriptName = '\\w+|:|\\*|-';
let arg = `${scriptName}| --`;
let reserved = '(re)?start|stop|test|publish|(un)?install|version';
let reservedTest = '(te?s)?t';
let redrunArg = '--?\\w+';
let redrunEnd = ';|&&?|\\|\\|?|>|<| #';

module.exports.enter        = RegExp(`redrun\\s|(npm (${run}|${reserved}|${reservedTest}))`);
module.exports.arg          = RegExp(`npm ${run} (${arg})+`, 'g');
module.exports.name         = RegExp(`(${scriptName})+`);
module.exports.reserved     = RegExp(`npm (${reserved})`);
module.exports.reservedTest = RegExp(`^npm ${reservedTest}$`);
module.exports.redrun       = RegExp(`redrun(\\s|${redrunArg}|${scriptName}|${redrunEnd})+`);
module.exports.redrunEnd    = RegExp(`\\s+(${redrunEnd}).*`);
module.exports.cli          = cli();

function cli() {
    const version = 'v(ersion)?';
    const help = 'h(elp)?';
    const loud = 'l(oud)?';
    const series = 's(eries)?';
    const parallel = 'p(arallel)?';
    const calm = 'c(alm)?';
    const parallelCalm = 'P|parallel(C|-c)alm';
    const seriesCalm = 'S|series(C|-c)alm';
    
    const args = [
        version,
        help,
        loud,
        calm,
        series,
        seriesCalm,
        parallel,
        parallelCalm
    ].join('|');
    
    const regexp = RegExp(`^(_|\\$0|${args})$`);
    
    return regexp;
}
