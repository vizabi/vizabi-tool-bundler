/* eslint-disable no-undef */
const path = require('path');
const eslint = require("@rollup/plugin-eslint");
const resolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const scss = require("rollup-plugin-scss");
const json = require("@rollup/plugin-json");
const trash = require("rollup-plugin-delete");
const copy = require("rollup-plugin-copy");
const archiver = require('archiver');
const { visualizer } = require('rollup-plugin-visualizer');

const timestamp = new Date();
const __PROD__ = process.env.NODE_ENV === 'production';

module.exports = (name, nameLower, dir, meta) => ({
  input: {
    [nameLower || meta.name]: path.resolve(dir,'src/index.js')
  },
  output: {
    name: name || meta.name,
    dir: path.resolve(dir, "build"),
    format: "umd",
    banner: `// ${meta.homepage} v${meta.version} build ${+timestamp} Copyright ${timestamp.getFullYear()} ${meta.author.name} and contributors`,
    sourcemap: true,
    interop: "esModule",
    globals: {
      "mobx": "mobx",
      "d3": "d3",
      "@vizabi/core": "Vizabi",
      "@vizabi/shared-components": "VizabiSharedComponents"
    }
  },
  external: ["mobx", "d3", "@vizabi/core", "@vizabi/shared-components"],
  plugins: [
    trash({
      targets: ['build/*']
    }),
    copy({
      targets: [{
        src: [path.resolve(dir,"src/assets")],
        dest: path.resolve(dir, "build")
      }]
    }),
    resolve(),
    (__PROD__ && eslint()),
    commonjs(),
    scss({
      include: path.resolve(dir,"src/**/*.scss"),
      output: (path.resolve(dir, "build")) + "/" + (nameLower || meta.name) + ".css",
    }),
    json(),
    replace({
      preventAssignment: true,
      values: {
        ENV: JSON.stringify(process.env.NODE_ENV || "development"),
        __VERSION: JSON.stringify(meta.version),
        __BUILD: +timestamp,
        __PACKAGE_JSON_FIELDS: JSON.stringify({
          homepage: meta.homepage,
          name: meta.name,
          description: meta.description
        })
      }
    }),
    __PROD__ && visualizer({
      filename: "./build/stats.html"
    }),
    //copy travis config from tool bundler to tool repo, so that one config is shared for all tools
    copy({
      targets: [{src: "node_modules/vizabi-tool-bundler/travis.yml", dest: ".", rename: ".travis.yml"}]
    })
  ]
});
