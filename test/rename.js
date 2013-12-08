'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path');
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

function rename(outfile, outdir, relative) { 
  return outfile.toUpperCase();
}

test('\nrunning no transform but renaming each outfile', function (t) {
  var progress = []
    , data = {}

  mutiny({ getOutStream: accOut.bind(null, data), outdir: out, rename: rename, __allow_out_and_rename__: true }, { root: root })
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
        , { '/FIXTURES/OUT/INDEX.HTML': [ '<html>\n  <body>\n    <h1>index</h1>  \n  </body>\n</html>\n' ],
            '/FIXTURES/OUT/SUB1/ONE.HTML': [ '<html>\n  <body>\n    <h1>one</h1>  \n  </body>\n</html>\n' ],
            '/FIXTURES/OUT/SUB2/TWO.HTML': [ '<html>\n  <body>\n    <h1>two</h1>  \n  </body>\n</html>\n' ] }
        , 'calls getOutStream with renamed outfile and original content'
      )
      t.end()
    });
})
