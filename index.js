'use strict';

var readdirp      =  require('readdirp')
  , through       =  require('through2')
  , requireModule =  require('require-module')

var defaultGetOutStream = require('./lib/default-getOutStream')
  , transformContent = require('./lib/transform-content')
  , filterDirsAndResolveOutStream = require('./lib/filter-dirs-and-source-out-stream')

function keepName(outfile, outdir, relative) { return outfile }

/**
 * Mutates the files of a directory recursively applying specified transform and/or a rename function.
 * The transformed files are saved into the outdir and directory structure is maintained.
 * 
 * @name mutiny 
 * @function
 * @param {Object} mutinyopts 
 * @param {String} mutinyopts.outdir: the root of the directory to which to write the transformed/renamed files
 * @param {Array.<(Function|String)>} mutinyopts.transform: that transform each file's content
 *
 *  **transform function signature:** `function(String):TransformStream`
 *
 *  **Note**: each transform can be a function or a name of an installed transform or a path to a local module
 *
 * @param {Function(String, String, String):String} mutinyopts.rename: renames each file
 *
 *  **signature:** `function ({String} outfile, {String} outdir, {String} relativeOutfile) : {String} outfile`
 *
 * @param {Function(String, String, String):WriteStream} mutinyopts.getOutStream: allows overriding the defaultOutStream in case rename is not sufficient
 *
 *  **signature:** `function ({String} outfile, {String} outdir, {String} relativeOutfile) : {WriteStream}`
 *
 * @param {Object} readopts options passed through to [readdirp]{@link https://github.com/thlorenz/readdirp}
 * @param {String} readopts.root the `root` of the source directory that needs to be specified
 * @return {ReadStream} which emits 'error' and or 'data' to update mutiny's progress
 */
var go = module.exports = function mutiny(mutinyopts, readopts) {
  var transform
    , outdir = mutinyopts.outdir
    , progress = through({ objectMode: true });

  readopts = readopts || {}

  if (!outdir && !mutinyopts.getOutStream) {
    progress.emit('error', new Error('Need to supply the outdir option (full path to where to store transformed files) or provide custom outStream function.'));
  }

  if (mutinyopts.getOutStream && mutinyopts.rename && !mutinyopts.__allow_out_and_rename__) {
    progress.emit('error', new Error('If you already supply the outstream it doesn\'t make any sense to also supply a rename function'));
  }

  var rename = mutinyopts.rename || keepName;
  var getOutStream = mutinyopts.getOutStream || defaultGetOutStream 

  if (mutinyopts.transform) {
    transform = (Array.isArray(mutinyopts.transform) ? mutinyopts.transform : [ mutinyopts.transform ])
      .map(function (tx) { 
        return typeof tx === 'string' ? requireModule(tx) : tx;
      })
  }

  readdirp(readopts)
    .on('warn', progress.emit.bind(progress, 'warn'))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(through({ objectMode: true }, filterDirsAndResolveOutStream(getOutStream, rename, outdir)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(through({ objectMode: true }, transformContent(progress, transform)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(progress);

  return progress;
};
