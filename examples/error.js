'use strict';

var path = require('path');
var mutiny = require('../');

function toUpper(file, content, cb) {
  if ((/two/mg).test(content)) return cb(new Error('I hate to be number two!'));
  cb(null, content.toUpperCase());  
}

function trimLeading(file, content, cb) {
  var c = content.replace(/^\s+/mg, '');
  cb(null, c);
}

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');
var transforms = [ toUpper, trimLeading ];

mutiny({ root: root }, transforms)
  .on('error', console.error)
  .on('data', console.log)
