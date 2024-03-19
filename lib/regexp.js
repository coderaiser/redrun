const run = 'run(-script)?';
const scriptName = '\\w+|:|\\*|-|\\.';
const _arg = `${scriptName}| --`;
const _reserved = '(re)?start|stop|test';
const _reservedTest = '(te?s)?t';
const redrunArg = '--?\\w+';
const _redrunEnd = ';|&&?|\\|\\|?|>|<| #|"';

export const enter = RegExp(`madrun\\s|redrun\\s|(npm (${run}|${_reserved}|${_reservedTest}))`);
export const arg = RegExp(`npm ${run} (${_arg})+`, 'g');
export const name = RegExp(`(${scriptName})+`);
export const reserved = RegExp(`npm (${_reserved})`);
export const reservedTest = RegExp(`^npm ${_reservedTest}$`);
export const redrun = RegExp(`(npx\\s)?redrun(\\s|${redrunArg}|${scriptName}|${_redrunEnd})+`);
export const madrun = RegExp(`(npx\\s)?madrun\\s(${redrunArg}|${scriptName}|${_redrunEnd})+`);
export const redrunEnd = RegExp(`\\s+(${_redrunEnd}).*`);
export const cli = buildCLI();

function buildCLI() {
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
