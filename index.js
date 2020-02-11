/* eslint-disable no-undef */
const path = require('path');
const meta = require("./package.json");

const babel = require("rollup-plugin-babel");
const {eslint} = require("rollup-plugin-eslint");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const {terser} = require("rollup-plugin-terser");
const sass = require("rollup-plugin-sass");
const json = require("rollup-plugin-json");
const trash = require("rollup-plugin-delete");
const copy = require("rollup-plugin-copy");
const archiver = require('archiver');

const copyright = `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`;
const timestamp = new Date();
const __PROD__ = process.env.NODE_ENV === 'production';

module.exports = (chartName, chartNameLower, dir, output) => ({
  input: {
    [chartNameLower || meta.name]: path.resolve(dir,'src/index.js')
  },
  output: {
    name: chartName || meta.name,
    dir: output || path.resolve(dir, "build"),
    format: "umd",
    banner: copyright,
    sourcemap: true,
    globals: {
      "mobx": "mobx",
      "Vizabi": "Vizabi",
      "VizabiSharedComponents": "VizabiSharedComponents"
    }
  },
  external: ["mobx", "Vizabi", "VizabiSharedComponents"],
  plugins: [
    !output && trash({
      targets: ['build/*']
    }),
    copy({
      targets: [{
        src: [path.resolve(dir,"src/assets")],
        dest: output || path.resolve(dir, "build")
      }]
    }),
    resolve(),
    (__PROD__ && eslint()),
    commonjs(),
    sass({
      include: path.resolve(dir,"src/**/*.scss"),
      output: (output || path.resolve(dir, "build")) + "/" + (chartNameLower || meta.name) + ".css",
    }),
    json(),
    // babel({
    //   exclude: "node_modules/**"
    // }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || "development"),
      __VERSION: JSON.stringify(meta.version),
      __BUILD: +timestamp
    }),
    (__PROD__ && terser({output: {preamble: copyright}})),
    //copy travis config from tool bundler to tool repo, so that one config is shared for all tools
    copy({
      targets: [{src: "node_modules/vizabi-tool-bundler/travis.yml", dest: ".", rename: ".travis.yml"}]
    })
  ]
});
