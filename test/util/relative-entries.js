'use strict';

var path = require('path');

function relative(file) {
  return file ? file.slice(path.join(__dirname, '..').length) : file;
}

module.exports = function relativeEntries(entries) {
  return entries.map(function(e) {
    return { 
        file: relative(e.file)
      , outfile: relative(e.outfile)
    }
  })
}
