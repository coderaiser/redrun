'use strict';

const startQuote = quote(/^\"/);
const endQuote = quote(/\"$/);

module.exports = (str) => {
    const line = ' -- ';
    
    if (!str.includes(line))
        return str;
    
    const length = line.length;
    const index = str.indexOf(line);
    
    const command = str.slice(0, index);
    const args = str.slice(index + length)
        .split(' ')
        .map(addQuotes)
        .join(' ');
    
    return `${command} ${args}`;
};

function addQuotes(arg) {
    if (arg === '--')
        return arg;
    
    return startQuote(arg) + arg + endQuote(arg);
}

function quote(reg) {
    return (arg) => {
        if (!reg.test(arg))
            return '"';
        
        return '';
    }
}

