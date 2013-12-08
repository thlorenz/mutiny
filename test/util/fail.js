'use strict';

module.exports = function fail(t, err) {
  t.fail(err); 
  t.end();
}
