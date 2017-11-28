"use strict";

const test = require("ava");
const zlib = require("zlib");
const crypto = require("crypto");
const zlibSample = require("../src/index");


test("inflate", async t => {
  const myZlib = await zlibSample.initialize();
  let source;
  let deflated;

  for (let i = 0; i < 10; i++) {
    source = crypto.randomBytes(1);
    deflated = zlib.deflateRawSync(source, {});
    t.true(myZlib.inflate(deflated).equals(source));
    
    source = crypto.randomBytes(1024);
    deflated = zlib.deflateRawSync(source, {});
    t.true(myZlib.inflate(deflated).equals(source));

    source = crypto.randomBytes(1024 * 1024);
    deflated = zlib.deflateRawSync(source, {});
    t.true(myZlib.inflate(deflated).equals(source));
  }
});

test("deflate", async t => {
  const myZlib = await zlibSample.initialize();
  let source;
  let deflated;

  for (let i = 0; i < 10; i++) {
    source = crypto.randomBytes(1);
    deflated = myZlib.deflate(source);
    t.true(zlib.inflateRawSync(deflated).equals(source));

    source = crypto.randomBytes(1024);
    deflated = myZlib.deflate(source);
    t.true(zlib.inflateRawSync(deflated).equals(source));
    
    source = crypto.randomBytes(1024 * 1024);
    deflated = myZlib.deflate(source);
    t.true(zlib.inflateRawSync(deflated).equals(source));
  }
});
