'use strict';

var relative = require('./relative');

module.exports = function relativeEntries(entries) {
  return entries.map(function(e) {
    return { 
        file: relative(e.file)
      , outfile: relative(e.outfile)
    }
  })
}
