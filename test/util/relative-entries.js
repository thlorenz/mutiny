'use strict';

var path = require('path');

module.exports = function relative(entries) {
  return entries.map(function(e) {
    return {
        file: e.file.slice(path.join(__dirname, '..').length)
      , content: e.content
    }
  })
}
