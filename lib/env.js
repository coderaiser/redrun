'use strict';

let path = require('path');

module.exports = () => {
    bin();
};

function bin() {
    process.env.PATH += path.delimiter + 'node_modules/.bin';
}

