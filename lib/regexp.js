'use strict';

const run = 'run(-script)?';
const scriptName = '\\w+|:|\\*|-|\\.';
const arg = `${scriptName}| --`;
const reserved = '(re)?start|stop|test';
const reservedTest = '(te?s)?t';
const redrunArg = '--?\\w+';
const redrunEnd = ';|&&?|\\|\\|?|>|<| #|"';

/* eslint no-multi-spaces: 0 */
module.exports.enter        = RegExp(`madrun\\s|redrun\\s|(npm (${run}|${reserved}|${reservedTest}))`);
module.exports.arg          = RegExp(`npm ${run} (${arg})+`, 'g');
module.exports.name         = RegExp(`(${scriptName})+`);
module.exports.reserved     = RegExp(`npm (${reserved})`);
module.exports.reservedTest = RegExp(`^npm ${reservedTest}$`);
module.exports.redrun       = RegExp(`(npx\\s)?redrun(\\s|${redrunArg}|${scriptName}|${redrunEnd})+`);
module.exports.madrun       = RegExp(`(npx\\s)?madrun\\s(${redrunArg}|${scriptName}|${redrunEnd})+`);
module.exports.redrunEnd    = RegExp(`\\s+(${redrunEnd}).*`);
module.exports.cli          = cli();

function cli() {
    const version = 'v(ersion)?';
    const help = 'h(elp)?';
    const quiet = 'q(uiet)?';
    const series = 's(eries)?';
    const parallel = 'p(arallel)?';
    const calm = 'c(alm)?';
    const parallelCalm = 'P|parallel(C|-c)alm';
    const seriesCalm = 'S|series(C|-c)alm';
    
    const args = [
        version,
        help,
        quiet,
        calm,
        series,
        seriesCalm,
        parallel,
        parallelCalm,
    ].join('|');
    
    return RegExp(`^(_|\\$0|${args})$`);
}
