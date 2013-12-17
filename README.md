# mutiny [![build status](https://secure.travis-ci.org/thlorenz/mutiny.png)](http://travis-ci.org/thlorenz/mutiny)

Recursively mutates files in a given directory.

```js
var through = require('through2');
var mutiny = require('mutiny');

function toUpper(file, content) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

var readdirpOpts = { root: __dirname + '/root' };
mutiny({ outdir: __dirname + '/out', transform: [ toUpper ]}, readdirpOpts)
  .on('error', console.error)
  .on('data', function (d) { console.log('\nProcessed:\n', d); })
```
[transform example](https://github.com/thlorenz/mutiny/tree/master/examples/transform-only.js)

```sh
# assuming trim-leading is a transform installed as a node_module
mutiny ./root -t ./local-transform/toUpper.js -t trim-leading -o ./out 
```
[bin example](https://github.com/thlorenz/mutiny/tree/master/examples/bin)

## Installation

    npm install mutiny

## API

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="mutiny"><span class="type-signature"></span>mutiny<span class="signature">(mutinyopts, readopts)</span><span class="type-signature"> &rarr; {ReadStream}</span></h4>
</dt>
<dd>
<div class="description">
<p>Mutates the files of a directory recursively applying specified transform and/or a rename function.
The transformed files are saved into the outdir and directory structure is maintained.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>mutinyopts</code></td>
<td class="type">
<span class="param-type">Object</span>
</td>
<td class="description last">
<h6>Properties</h6>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>outdir:</code></td>
<td class="type">
<span class="param-type">String</span>
</td>
<td class="description last"><p>the root of the directory to which to write the transformed/renamed files</p></td>
</tr>
<tr>
<td class="name"><code>transform:</code></td>
<td class="type">
<span class="param-type">Array.&lt;(function()|String)></span>
</td>
<td class="description last"><p>that transform each file's content</p>
<p> <strong>transform function signature:</strong> <code>function(String):TransformStream</code></p>
<p> <strong>Note</strong>: each transform can be a function or a name of an installed transform or a path to a local module</p></td>
</tr>
<tr>
<td class="name"><code>rename:</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="description last"><p>renames each file</p>
<p> <strong>signature:</strong> <code>function ({String} outfile, {String} outdir, {String} relativeOutfile) : {String} outfile</code></p></td>
</tr>
<tr>
<td class="name"><code>getOutStream:</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="description last"><p>allows overriding the defaultOutStream in case rename is not sufficient</p>
<p> <strong>signature:</strong> <code>function ({String} outfile, {String} outdir, {String} relativeOutfile) : {WriteStream}</code></p></td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td class="name"><code>readopts</code></td>
<td class="type">
<span class="param-type">Object</span>
</td>
<td class="description last"><p>options passed through to <a href="https://github.com/thlorenz/readdirp">readdirp</a></p>
<h6>Properties</h6>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>root</code></td>
<td class="type">
<span class="param-type">String</span>
</td>
<td class="description last"><p>the <code>root</code> of the source directory that needs to be specified</p></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/mutiny/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/mutiny/blob/master/index.js#L13">lineno 13</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>which emits 'error' and or 'data' to update mutiny's progress</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">ReadStream</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="transformContent"><span class="type-signature"></span>transformContent<span class="signature">(progress, transforms)</span><span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>Runs all transforms on the content of all files that are piped into its file stream.
Reports progress by pushing into the @see progress stream.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>progress</code></td>
<td class="type">
<span class="param-type">Stream</span>
</td>
<td class="description last"><p>into which progress data is pushed</p></td>
</tr>
<tr>
<td class="name"><code>transforms</code></td>
<td class="type">
<span class="param-type">Array.&lt;function(String): Stream></span>
</td>
<td class="description last"><p>functions that return a transform stream when invoked with a path to a file
- signature of each transform: <code>function ({String} file) : {TransformStream}</code></p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/mutiny/blob/master/lib/transform-content.js">lib/transform-content.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/mutiny/blob/master/lib/transform-content.js#L24">lineno 24</a>
</li>
</ul></dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
<!-- END docme generated API please keep comment here to allow auto update -->

## More Examples

Please find more examples in the [examples directory](https://github.com/thlorenz/mutiny/tree/master/examples) and consult the [tests](https://github.com/thlorenz/mutiny/tree/master/tests)

## License

MIT
