'use strict';

const startQuote = quote(/^"/);
const endQuote = quote(/"$/);
const regEnter = require('./regexp').enter;

module.exports = (str) => {
    const line = ' -- ';
    
    if (!~str.indexOf(line))
        return str;
    
    const {length} = line;
    const index = str.indexOf(line);
    
    const command = str.slice(0, index);
    const params = str.slice(index + length);
    
    if (!regEnter.test(str))
        return str;
    
    if (regEnter.test(params))
        return `${command} ${addQuotesOnce(params)}`;
    
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

function addQuotesOnce(str) {
    const isBegin = /^['"]/.test(str);
    const isEnd = /['"]$/.test(str);
    
    if (isBegin && isEnd)
        return str;
    
    return `"${str}"`;
}

