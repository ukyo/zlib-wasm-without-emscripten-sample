const path = require("path");
const mkdirp = require("mkdirp");
const waCliUtil = require("webassembly/cli/util");
const OPTIMIZATION_LEVEL = process.argv[2] || "-Oz";

const zlibSources = [
  "adler32",
  "crc32",
  "deflate",
  "infback",
  "inffast",
  "inflate",
  "inftrees",
  "trees",
  "zutil",
];

const builddir = path.join(__dirname, "build");
const srcdir = path.join(__dirname, "src");
const zlibdir = path.join(__dirname, "zlib");

mkdirp.sync(path.join(__dirname, "build"));

(async () => {
  await waCliUtil.run(path.join(waCliUtil.bindir, "clang"), [
    zlibSources.map(s => path.join(zlibdir, `${s}.c`)),
    OPTIMIZATION_LEVEL,
    "-c",
    "--target=wasm32-unknown-unknown",
    "-D", "WEBASSEMBLY",
    "-emit-llvm",
    "-nostdinc",
    "-nostdlib",
    "-fno-builtin",
    "-isystem", path.join(waCliUtil.basedir, "include"),
    "-isystem", path.join(waCliUtil.basedir, "lib/musl-wasm32/include"),
    "-isystem", path.join(srcdir, "include"),
    `-I${zlibdir}`,
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "llvm-link"), [
    zlibSources.map(s => `${s}.bc`),
    "-o", "zlib.bc",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "clang"), [
    path.join(srcdir, "zlib-sample.c"),
    OPTIMIZATION_LEVEL,
    "-c",
    "--target=wasm32-unknown-unknown",
    "-D", "WEBASSEMBLY",
    "-emit-llvm",
    "-nostdinc",
    "-nostdlib",
    "-fno-builtin",
    "-isystem", path.join(waCliUtil.basedir, "include"),
    "-isystem", path.join(waCliUtil.basedir, "lib/musl-wasm32/include"),
    "-isystem", path.join(srcdir, "include"),
    `-I${zlibdir}`,
    `-I${path.join(srcdir, "import.h")}`,
    "-o", "tmp-zlib-sample.bc",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "llvm-link"), [
    "tmp-zlib-sample.bc",
    "zlib.bc",
    path.join(waCliUtil.basedir, "lib", "webassembly.bc"),
    "-only-needed",
    "-o", "zlib-sample.bc",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "llc"), [
    "zlib-sample.bc",
    "-march=wasm32",
    "-filetype=asm",
    "-asm-verbose=false",
    "-thread-model=single",
    "-data-sections",
    "-function-sections",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "s2wasm"), [
    "zlib-sample.s",
    "--import-memory",
    "--allocate-stack", "10000",
    "-o", "zlib-sample.wat",
  ], { cwd: builddir });

  await waCliUtil.run(path.join(waCliUtil.bindir, "wasm-opt"), [
    "zlib-sample.wat",
    "-O3",
    "--coalesce-locals-learning",
    "--dce",
    "--duplicate-function-elimination",
    "--inlining",
    "--local-cse",
    "--merge-blocks",
    "--optimize-instructions",
    "--reorder-functions",
    "--reorder-locals",
    "--vacuum",
    "-o", "zlib-sample.wasm",
  ], { cwd: builddir });
})();
