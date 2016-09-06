'use strict';

module.exports = (str) => {
    const line = ' -- ';
    
    if (!str.includes(line))
        return str;
    
    const length = line.length;
    const index = str.indexOf(line);
    
    const command = str.slice(0, index);
    const args = str.slice(index + length);
    
    return `${command} "${args}"`;
};

