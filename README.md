# reacthtmlpack [![Travis CI][travis-image]][travis-url] [![Quality][codeclimate-image]][codeclimate-url] [![Coverage][codeclimate-coverage-image]][codeclimate-coverage-url] [![Dependencies][gemnasium-image]][gemnasium-url] [![Gitter][gitter-image]][gitter-url]

[![Join the chat at https://gitter.im/tomchentw/reacthtmlpack](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tomchentw/reacthtmlpack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
> Using HTML templates as entry points for webpack

[![Version][npm-image]][npm-url]


## Installation

```sh
npm install reacthtmlpack --save
```


## Getting Started

The simplest example is [SimpleScript](https://github.com/tomchentw/reacthtmlpack/tree/master/examples/SimpleScript). It takes **4** steps to build them up.


### 1 - Generate HTML Template with React

Create an [`index.html.js`](https://github.com/tomchentw/reacthtmlpack/blob/master/examples/SimpleScript/scripts/index.html.js) file that exports your html template as react elements.

```js
export default (
  <html>
    <head>
    // omitted ...
    </body>
  </html>
);
```

#### Notice

* This file will be `require`d and evaluated in **node** context. Be sure to only use components that don't contain browser stuff.
* The default export is a *instance* of `ReactElement`. Exporting the *class* of `React.Component` (or `React.createClass`) is **NOT** supported.
* You have to import `React` in your code since JSX transformer in babel will need it present in the local scope.


### 2 - Put <WebpackScriptEntry> Component(s) in the Template

Inside the `<body>` of [`index.html.js`](https://github.com/tomchentw/reacthtmlpack/blob/master/examples/SimpleScript/scripts/index.html.js), add `<WebpackScriptEntry>`.

```js
    // omitted ...
    <WebpackScriptEntry
      chunkName="assets/client"
      chunkFilepath="./scripts/client.js"
      configFilepath="../SimpleScript.webpackConfig.js"
    />
    </body>
  </html>
);
```

The `WebpackScriptEntry` specified your webpack entry point for the application. It will be replaced to `<script>` after webpack compiles. There are three required props: `chunkName`, `chunkFilepath` and `configFilepath`:

#### `(string) chunkName`

The **key** part of [`entry` object property in the webpack config file](http://webpack.github.io/docs/configuration.html#entry).

#### `(string/array<string>) chunkFilepath`

The **value** part of [`entry` object property in the webpack config file](http://webpack.github.io/docs/configuration.html#entry).

#### `(string) configFilepath`

The **relative filepath** from this template to your webpack config file. The webpack config will be responsible for generating the entry.

#### Notice

* Unlike webpack config, `chunkName` is always required for explicity.
* The filepath in `chunkFilepath` should be relative to your [webpack context](http://webpack.github.io/docs/configuration.html#context). To reduce debugging time, you should set the `context` property in the webpack config file.


### 3 - Setting up Webpack Config File

Create [the webpack config file](https://github.com/tomchentw/reacthtmlpack/blob/master/examples/SimpleScript/SimpleScript.webpackConfig.js). Please don't include `entry` property in the config since we already specify it using `<WebpackScriptEntry>`. If you do, they will be replaced by *reacthtmlpack* and thus has **NO** effect.

```js
module.exports = {
  context: __dirname,
  output: {
    path: Path.resolve(__dirname, "../../public"),
    filename: "[name].js",
  },
  module: {
    loaders: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        loaders: ["babel"],
      },
    ],
  },
  // ... omitted
};
```

#### Notice

* To reduce debugging time, you should set [the `context` property in the webpack config file](http://webpack.github.io/docs/configuration.html#context).


### 4 - Build up the Assets

```sh
cd examples/SimpleScript
npm install
npm run dev # reacthtmlpack buildToDir ../../public ./scripts/*.html.js
```


## Examples

The examples list below is sorted from simple to complex.

### SimpleScript

https://github.com/tomchentw/reacthtmlpack/tree/master/examples/SimpleScript

* One script entry
* Zero style entry
* Zero require("*.css") in JavaScript
* One webpack config
* Smallest webpack.config.js
* One "scripts" command in package.json
  - `npm run dev` # Build your assets in development mode and output to public folder

**Notice** You could use `cd public && python -m SimpleHTTPServer 8080` to start a simple http server to serve compiled `index.html` and `assets/client.js`.

### SimpleStyle

https://github.com/tomchentw/reacthtmlpack/tree/master/examples/SimpleStyle

* One script entry
* Multiple style entry
* Zero require("*.css") in JavaScript
* One webpack config
* Smallest webpack.config.js with style support
* Two "scripts" command in package.json
  - `npm run dev`
  - `npm run watch` # Watch and build your assets in development mode and output to public folder

### SimpleAssets

https://github.com/tomchentw/reacthtmlpack/tree/master/examples/SimpleAssets

* One script entry
* One style entry (via require("*.css"))
* One require("*.css") in JavaScript
* One webpack config
* Medium sized webpack.config.js
  - NODE_ENV=production/development
* Three "scripts" command in package.json
  - `npm run dev`
  - `npm run watch`
  - `npm run build` # Build your assets in production mode and output to public folder

### AssetsWithDevServer

https://github.com/tomchentw/reacthtmlpack/tree/master/examples/AssetsWithDevServer

* One script entry
* One style entry (via require("*.css"))
* One require("*.css") in JavaScript
* One webpack config
* Large sized webpack.config.js
  - style support
  - NODE_ENV=production/development
  - react-hot-loader
  - filename with `[chunkhash]`
  - devServer
* Three "scripts" command in package.json
  - `npm run dev`
  - `npm run build`
  - `npm start` # Start webpack-dev-server with HMR support and use public folder to serve `index.html`

### gh-pages

https://github.com/tomchentw/reacthtmlpack/tree/master/examples/gh-pages

* One script entry
* One style entry (via require("*.css"))
* One require("*.css") in JavaScript
* Two webpack config
  - One for normal client-side assets bundling
  - The other compiles stuff for server-rendering
* **Server-rendering**
* Large sized webpack.config.js
  - style support
  - NODE_ENV=production/development
  - react-hot-loader
  - filename with `[chunkhash]`
  - devServer
  - Bundling for server-render support
* Three "scripts" command in package.json
  - `npm run dev`
  - `npm run build`
  - `npm start`

Why server-render bundling? This worth another blog post...(TBC)

## Contributing

[![devDependency Status][david-dm-image]][david-dm-url]

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


[npm-image]: https://img.shields.io/npm/v/reacthtmlpack.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/reacthtmlpack

[travis-image]: https://img.shields.io/travis/tomchentw/reacthtmlpack.svg?style=flat-square
[travis-url]: https://travis-ci.org/tomchentw/reacthtmlpack
[codeclimate-image]: https://img.shields.io/codeclimate/github/tomchentw/reacthtmlpack.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/tomchentw/reacthtmlpack
[codeclimate-coverage-image]: https://img.shields.io/codeclimate/coverage/github/tomchentw/reacthtmlpack.svg?style=flat-square
[codeclimate-coverage-url]: https://codeclimate.com/github/tomchentw/reacthtmlpack
[gemnasium-image]: https://img.shields.io/gemnasium/tomchentw/reacthtmlpack.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/tomchentw/reacthtmlpack
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/tomchentw/reacthtmlpack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[david-dm-image]: https://img.shields.io/david/dev/tomchentw/reacthtmlpack.svg?style=flat-square
[david-dm-url]: https://david-dm.org/tomchentw/reacthtmlpack#info=devDependencies
