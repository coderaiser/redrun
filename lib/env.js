'use strict';

const jessy = require('jessy');
const keys = require('./keys');

module.exports.path = (pathEnv, delimiter, cwdEnv, sep) => {
    const result = pathEnv + delimiter + cwdEnv + sep + 'node_modules/.bin';
    
    return result;
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

