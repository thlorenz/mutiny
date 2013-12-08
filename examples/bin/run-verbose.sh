#!/usr/bin/env sh

node ../../bin/mutiny.js -v  -t ./local-transform/toUpper.js -t trim-leading -o ../../test/fixtures/mutinied  ../../test/fixtures/root/
