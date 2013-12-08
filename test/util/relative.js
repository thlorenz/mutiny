'use strict';

var path = require('path');

module.exports = function relative(file) {
  return file ? file.slice(path.join(__dirname, '..').length) : file;
}
