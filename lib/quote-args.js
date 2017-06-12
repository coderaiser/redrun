'use strict';

const startQuote = quote(/^"/);
const endQuote = quote(/"$/);
const regEnter = require('./regexp').enter;

module.exports = (str) => {
    const line = ' -- ';
    
    if (!~str.indexOf(line))
        return str;
    
    const length = line.length;
    const index = str.indexOf(line);
    
    const command = str.slice(0, index);
    const params = str.slice(index + length);
    
    if (!regEnter.test(str))
        return str;
    
    if (regEnter.test(params))
        return `${command} ${params}`;
    
    const args = params
        .split(' ')
        .map(addQuotes)
        .join(' ');
    
    return `${command} ${args}`;
};

function addQuotes(arg) {
    return startQuote(arg) + arg + endQuote(arg);
}

function quote(reg) {
    return (arg) => {
        if (!reg.test(arg))
            return '"';
        
        return '';
    };
}

