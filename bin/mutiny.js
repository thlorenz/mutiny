#!/usr/bin/env node
'use strict';

var path          =  require('path')
  , fs            =  require('fs')
  , mutiny        =  require('../')
  , requireModule =  require('require-module')

var argv    =  require('minimist')(
    process.argv.slice(2)
  , { 'boolean': [ 'v' ] }
)

var filter  =  argv.f
  , outdir  =  argv.o && path.resolve(argv.o)
  , rename  =  argv.r && requireModule(argv.r)
  , verbose =  argv.v || argv.verbose
  , root    =  argv._[0] && path.resolve(argv._[0])

if (!outdir)  throw new Error('Need to specify output dir via -o');
if (!root)    throw new Error('Need to specify root dir i.e. ./root');

var transforms = [].concat(argv.t).filter(Boolean).map(function (file) { return requireModule(file) });

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

// Example:
// from examples/bin
// mutiny  -t ./local-transform/toUpper.js -t trim-leading -o ../../test/fixtures/mutinied  ../../test/fixtures/root/

if (verbose) inspect({ transforms: transforms, rename: rename, root: root, outdir: outdir })

mutiny(
      { transforms: transforms, rename: rename, outdir: outdir }
    , { root: root, fileFilter: filter }
  )
  .on('error', console.error)
  .on('data', function (entry) {
    if (verbose) inspect({ processed: entry });
    else process.stderr.write('.');
  })
  .on('error', console.error)
  .on('end', function () { console.error('\nSuccess: all files processed.') })
