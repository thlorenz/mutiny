'use strict';

var relative = require('./relative');
var through = require('through2');

module.exports = function accOut(data, file) {
  file = relative(file);
  if (!data[file]) data[file] = [];
  return through(function (chunk, enc, cb) {
    data[file].push(chunk.toString());  
    cb();
  })
}
