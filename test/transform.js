'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path');
var mutiny = require('../')
var adapt = require('./util/adapt-entries');

function toUpper(file, content, cb) {
  cb(null, content.toUpperCase());  
}

function toUpperError(file, content, cb) {
  if ((/two/mg).test(content)) return cb(new Error('I hate to be number two!'));
  cb(null, content.toUpperCase());  
}

function trimLeading(file, content, cb) {
  var c = content.replace(/^\s+/mg, '');
  cb(null, c);
}

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');

function fail(t, err) {
  t.fail(err); 
  t.end();
}

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}


test('\nrunning upperCase transform', function (t) {
  var data = []

  mutiny({ root: root }, toUpper)
    .on('error', fail.bind(t))
    .on('data', [].push.bind(data))
    .on('end', function () {
      t.deepEqual(
          adapt(data)
        , [ { file: '/fixtures/root/index.html',
            content: '<HTML>\n  <BODY>\n    <H1>INDEX</H1>  \n  </BODY>\n</HTML>\n' },
          { file: '/fixtures/root/sub1/one.html',
            content: '<HTML>\n  <BODY>\n    <H1>ONE</H1>  \n  </BODY>\n</HTML>\n' },
          { file: '/fixtures/root/sub2/two.html',
            content: '<HTML>\n  <BODY>\n    <H1>TWO</H1>  \n  </BODY>\n</HTML>\n' } ]
        , 'uppercases all content'
      )
      t.end()
    });
})

test('\nrunning upperCase and trimLeading transforms', function (t) {
  var data = []

  mutiny({ root: root }, [ toUpper, trimLeading ])
    .on('error', fail.bind(t))
    .on('data', [].push.bind(data))
    .on('end', function () {
      t.deepEqual(
          adapt(data)
        , [ { file: '/fixtures/root/index.html',
              content: '<HTML>\n<BODY>\n<H1>INDEX</H1>  \n</BODY>\n</HTML>\n' },
            { file: '/fixtures/root/sub1/one.html',
              content: '<HTML>\n<BODY>\n<H1>ONE</H1>  \n</BODY>\n</HTML>\n' },
            { file: '/fixtures/root/sub2/two.html',
              content: '<HTML>\n<BODY>\n<H1>TWO</H1>  \n</BODY>\n</HTML>\n' } ]
        , 'uppercases all content and trims leading spaces'
      )
      t.end()
    });
})


test('\nrunning error prone upperCase and trimLeading transforms', function (t) {
  var data = []

  mutiny({ root: root }, [ toUpperError, trimLeading ])
    .on('error', function (err) {
      t.similar(err, /I hate to be number two/, 'propagates error');
      t.end()
    })
    .on('data', [].push.bind(data))
    .on('end', fail.bind(t));
})
