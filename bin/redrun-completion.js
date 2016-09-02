#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

var name = path.join(__dirname, '..', 'shell/redrun-completion.sh');
var read = fs.createReadStream(name);
var write = process.stdout;

read.pipe(write);

