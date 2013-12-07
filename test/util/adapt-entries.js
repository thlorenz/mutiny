'use strict';

var sort = require('./sort-entries')
  , relative = require('./relative-entries')

var go = module.exports = function (entries) {
  return relative(sort(entries));
}
