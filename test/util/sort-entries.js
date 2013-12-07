'use strict';

var path = require('path');

var go = module.exports = function (entries) {
  return entries.reduce(function (sorted, e) {
    var filename = path.basename(e.file);

    if ((/index/).test(filename))     sorted[0] = e;
    else if ((/one/).test(filename))  sorted[1] = e;
    else                              sorted[2] = e;

    return sorted;
  }, []);
}
