'use strict';

const Benchmark = require('benchmark');
const util = require('util');
const fs = require('fs');
const path = require('path');
const pako = require('pako');

const zlibSample = require('../src/index.js');
const zlib = require('zlib');

(async () => {
  const myZlib = await zlibSample.initialize();
  const chunkSize = 32 * 1024;
  const source = fs.readFileSync(path.join(__dirname, "lorem_1mb.txt"));

  // warmup
  const deflated = zlib.deflateRawSync(source, { level: 6 });
  myZlib.inflate(deflated);
  pako.inflateRaw(deflated, { chunkSize });
  zlib.inflateRawSync(deflated, { chunkSize });

  await new Promise((resolve) => {
    console.log(`## payload size: ${source.length}`);

    const suite = new Benchmark.Suite();

    suite
      .add('wasm', {
        fn: () => {
          myZlib.inflate(deflated);
        },
      })
      .add('pako', {
        fn: () => {
          pako.inflateRaw(deflated, { chunkSize });
        },
      })
      .add('native', {
        fn: () => {
          zlib.inflateRawSync(deflated, { chunkSize });
        },
      })
      .on('cycle', (event) => {
        console.log(String(event.target));
      })
      .on('complete', () => {
        console.log('Fastest is ' + suite.filter('fastest').map('name'));
        resolve();
      })
      .run({ async: true });
  });
})();
