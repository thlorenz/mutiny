'use strict';

module.exports = function fail(err) {
  this.fail(err); 
  this.end();
}
