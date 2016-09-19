'use strict';

const jessy = require('jessy');
const keys = require('all-object-keys/legacy');

module.exports.path = (pathEnv, delimiter, cwdEnv, sep) => {
    return [
        cwdEnv,
        sep,
        'node_modules',
        sep,
        '.bin',
        delimiter,
        pathEnv
    ].join('');
};

module.exports.config = (config) => {
    let result = {};
    config = config || {};
    
    keys('_', config).forEach((key) => {
        let name = `npm_package_config_${key}`;
        let value = jessy(key, '_', config);
        
        result[name] = value;
    });
    
    return result;
};

