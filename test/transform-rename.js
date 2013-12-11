'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path');
var through = require('through2');
var mutiny = require('../')

var adapt = require('./util/adapt-entries')
  , relative = require('./util/relative')
  , fail = require('./util/fail')
  , accOut = require('./util/acc-out')

var fixtures = path.join(__dirname, '..', 'test', 'fixtures');
var root = path.join(fixtures, 'root');
var out = path.join(fixtures, 'out');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function toUpper(file, content) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

function rename(outfile, outdir, relative) { 
  return outfile.toUpperCase();
}

test('\nrunning upperCase transform and renaming each outfile', function (t) {
  var progress = []
    , data = {}

  mutiny(
      { getOutStream: accOut.bind(null, data), outdir: out, transform: toUpper, rename: rename, __allow_out_and_rename__: true }
    , { root: root }
    )
    .on('error', fail.bind(t))
    .on('data', [].push.bind(progress))
    .on('end', function () {

      t.deepEqual(
          adapt(progress)
        , [ { file: '/fixtures/root/index.html',
              outfile: '/FIXTURES/OUT/INDEX.HTML' },
            { file: '/fixtures/root/sub1/one.html',
              outfile: '/FIXTURES/OUT/SUB1/ONE.HTML' },
            { file: '/fixtures/root/sub2/two.html',
              outfile: '/FIXTURES/OUT/SUB2/TWO.HTML' } ]
        , 'reports outfiles as renamed in progress'
      )

      t.deepEqual(
          data
        , { '/FIXTURES/OUT/INDEX.HTML': [ '<HTML>\n  <BODY>\n    <H1>INDEX</H1>  \n  </BODY>\n</HTML>\n' ],
            '/FIXTURES/OUT/SUB1/ONE.HTML': [ '<HTML>\n  <BODY>\n    <H1>ONE</H1>  \n  </BODY>\n</HTML>\n' ],
            '/FIXTURES/OUT/SUB2/TWO.HTML': [ '<HTML>\n  <BODY>\n    <H1>TWO</H1>  \n  </BODY>\n</HTML>\n' ] }
        , 'calls getOutStream with renamed outfile and transformed content'
      )
      t.end()
    });
})
