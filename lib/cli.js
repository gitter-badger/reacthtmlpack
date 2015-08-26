"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.buildToDir = buildToDir;
exports.watchAndBuildToDir = watchAndBuildToDir;
exports.devServer = devServer;
exports.getMatchResult = getMatchResult;
exports.srcPatternToMatchResult = srcPatternToMatchResult;
exports.matchResultToMatchesFilepathReducer = matchResultToMatchesFilepathReducer;
exports.replaceWithHtmlExt = replaceWithHtmlExt;
exports.createWriteStaticMarkup$ToDestDir = createWriteStaticMarkup$ToDestDir;
exports.watchMultiCompiler$ToChildrenStats$ = watchMultiCompiler$ToChildrenStats$;
exports.addDevServerToEntryMapperCreator = addDevServerToEntryMapperCreator;
exports.startDevServerWithMultiCompiler$ToChildrenStats$MapperCreator = startDevServerWithMultiCompiler$ToChildrenStats$MapperCreator;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _path = require("path");

var _fs = require("fs");

var _glob = require("glob");

var _glob2base = require("glob2base");

var _glob2base2 = _interopRequireDefault(_glob2base);

var _rx = require("rx");

var _rx2 = _interopRequireDefault(_rx);

var _transducersJs = require("transducers-js");

var _webpackDevServer = require("webpack-dev-server");

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack = require("webpack");

var _webpack2 = _interopRequireDefault(_webpack);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _core = require("./core");

var writeFile = _rx.Observable.fromNodeCallback(_fs.writeFile);

/**
 * @public
 */

function buildToDir(destDir, srcPatternList) {
  var _getMatchResult = getMatchResult(srcPatternList);

  var filepath$ = _getMatchResult.filepath$;
  var relativePathByMatch$ = _getMatchResult.relativePathByMatch$;

  var xf = _transducersJs.comp.apply(undefined, [_core.xfFilepath$ToWebpackConfig$, (0, _transducersJs.map)(_core.webpackConfig$ToChunkList$), (0, _transducersJs.map)(_core.chunkList$ToStaticMarkup$), (0, _transducersJs.map)(createWriteStaticMarkup$ToDestDir(relativePathByMatch$, destDir))]);

  _rx.Observable.of(filepath$).transduce(xf).concatAll().subscribe(console.log.bind(console), console.error.bind(console), function () {
    console.log("done!");
  });
}

/**
 * @public
 */

function watchAndBuildToDir(destDir, srcPatternList) {
  var _getMatchResult2 = getMatchResult(srcPatternList);

  var filepath$ = _getMatchResult2.filepath$;
  var relativePathByMatch$ = _getMatchResult2.relativePathByMatch$;

  var xf = _transducersJs.comp.apply(undefined, [(0, _transducersJs.map)(_core.chunkList$ToStaticMarkup$), (0, _transducersJs.map)(createWriteStaticMarkup$ToDestDir(relativePathByMatch$, destDir))]);

  _rx.Observable.of(filepath$).transduce(_core.xfFilepath$ToWebpackConfig$).selectMany(function (webpackConfig$) {
    // Why selectMany? Because watch could be repeative.
    // Instead of wrapping one value, now a series of values are emitted.
    return _rx.Observable.of(webpackConfig$).map(_core.webpackConfig$ToWebpackCompiler$).combineLatest(webpackConfig$.count(), function (webpackCompiler$, count) {
      return { webpackCompiler$: webpackCompiler$, count: count };
    }).selectMany(function (_ref) {
      var webpackCompiler$ = _ref.webpackCompiler$;
      var count = _ref.count;

      return _rx.Observable.of(webpackCompiler$).map(watchMultiCompiler$ToChildrenStats$).selectMany(_transducersJs.identity).scan(function (acc, it) {
        acc = [].concat(_toConsumableArray(acc));
        var index = it.index;

        var rest = _objectWithoutProperties(it, ["index"]);

        acc[index] = rest;

        return acc;
      }, new Array(count)).takeWhile(function (acc) {
        return acc.every(_transducersJs.identity);
      }).map(function (acc) {
        return _rx.Observable.fromArray(acc);
      });
    }).map((0, _core.mergeWebpackStats$ToChunkList$WithWebpackConfig$)(webpackConfig$));
  }).transduce(xf).concatAll().subscribe(console.log.bind(console), console.error.bind(console), function () {
    console.log("done!");
  });
}

/**
 * @public
 */

function devServer(relativeDevServerConfigFilepath, destDir, srcPatternList) {
  var devServerConfigFilepath = (0, _path.resolve)(process.cwd(), relativeDevServerConfigFilepath);

  var _getMatchResult3 = getMatchResult(srcPatternList);

  var filepath$ = _getMatchResult3.filepath$;
  var relativePathByMatch$ = _getMatchResult3.relativePathByMatch$;

  var xf = _transducersJs.comp.apply(undefined, [(0, _transducersJs.map)(_core.chunkList$ToStaticMarkup$), (0, _transducersJs.map)(createWriteStaticMarkup$ToDestDir(relativePathByMatch$, destDir))]);

  _rx.Observable.of(filepath$).transduce(_core.xfFilepath$ToWebpackConfig$).selectMany(function (webpackConfig$) {
    // Why selectMany? Because devServer is watching and could be repeative.
    // Instead of wrapping one value, now a series of values are emitted.
    return _rx.Observable.of(webpackConfig$).map(addDevServerToEntryMapperCreator(devServerConfigFilepath)).map(_core.webpackConfig$ToWebpackCompiler$).combineLatest(webpackConfig$.count(), function (webpackCompiler$, count) {
      return { webpackCompiler$: webpackCompiler$, count: count };
    }).selectMany(function (_ref2) {
      var webpackCompiler$ = _ref2.webpackCompiler$;
      var count = _ref2.count;

      return _rx.Observable.of(webpackCompiler$).selectMany(startDevServerWithMultiCompiler$ToChildrenStats$MapperCreator(devServerConfigFilepath));
    }).map((0, _core.mergeWebpackStats$ToChunkList$WithWebpackConfig$)(webpackConfig$));
  }).transduce(xf).concatAll().subscribe(console.log.bind(console), console.error.bind(console), function () {
    console.log("done!");
  });
}

/**
 * @private
 */

function getMatchResult(srcPatternList) {
  var matchResult$ = _rx.Observable.fromArray(srcPatternList).selectMany(srcPatternToMatchResult).reduce(matchResultToMatchesFilepathReducer, { matches: [], relativePathByMatch: {} }).first();

  var filepath$ = matchResult$.selectMany(function (_ref3) {
    var matches = _ref3.matches;
    return _rx.Observable.fromArray(matches);
  });

  var relativePathByMatch$ = matchResult$.map(function (_ref4) {
    var relativePathByMatch = _ref4.relativePathByMatch;
    return relativePathByMatch;
  });

  return {
    filepath$: filepath$,
    relativePathByMatch$: relativePathByMatch$
  };
}

/**
 * @private
 */

function srcPatternToMatchResult(srcPattern) {
  var globber = new _glob.Glob(srcPattern);
  var base = (0, _glob2base2["default"])(globber);

  return _rx2["default"].Observable.create(function (observer) {
    function callback(matches) {
      observer.onNext({
        base: base,
        matches: matches
      });
      observer.onCompleted();
    };

    globber.once("end", callback);

    return globber.removeListener.bind(globber, "end", callback);
  });
}

/**
 * @private
 */

function matchResultToMatchesFilepathReducer(acc, _ref5) {
  var _acc$matches;

  var base = _ref5.base;
  var matches = _ref5.matches;

  (_acc$matches = acc.matches).push.apply(_acc$matches, _toConsumableArray(matches));
  matches.forEach(function (match) {

    var filepath = replaceWithHtmlExt(match);
    acc.relativePathByMatch[match] = (0, _path.relative)(base, filepath);
  });

  return acc;
}

/**
 * @private
 */

function replaceWithHtmlExt(filepath) {
  var dirpath = (0, _path.dirname)(filepath);

  var basename = (0, _path.basename)(filepath);

  while (true) {
    var ext = (0, _path.extname)(basename);
    if (ext) {
      basename = (0, _path.basename)(basename, ext);
    } else {
      return (0, _path.resolve)(dirpath, basename + ".html");
    }
  }
}

/**
 * @private
 */

function createWriteStaticMarkup$ToDestDir(relativePathByMatch$, destDir) {
  return function (staticMarkup$) {
    return staticMarkup$.combineLatest(relativePathByMatch$, function (_ref6, relativePathByMatch) {
      var filepath = _ref6.filepath;
      var markup = _ref6.markup;

      var relativePath = relativePathByMatch[filepath];

      return {
        filepath: (0, _path.resolve)(destDir, relativePath),
        markup: markup
      };
    }).selectMany(function (_ref7) {
      var filepath = _ref7.filepath;
      var markup = _ref7.markup;

      return writeFile(filepath, markup);
    });
  };
}

/**
 * @private
 */

function watchMultiCompiler$ToChildrenStats$(webpackCompiler$) {
  // return Observable.create(observer => {
  //   function callback (err, stats) {
  //     if (err) {
  //       observer.onError(err);
  //     } else {
  //       observer.onNext(stats);
  //     }
  //   }
  //   const watcher = webpackCompiler.watch({}, callback);
  //   return watcher.close.bind(watcher);
  // });
  // We cannot use the above code because we want every results in a sub compiler.
  // This is an issue of implementation details of webpack
  return webpackCompiler$.selectMany(function (webpackCompiler) {
    return _rx.Observable.fromArray(webpackCompiler.compilers);
  }).selectMany(function (compiler, index) {

    return _rx.Observable.create(function (observer) {
      function callback(err, stats) {
        if (err) {
          observer.onError(err);
        } else {
          observer.onNext({
            index: index,
            stats: stats,
            statsJson: stats.toJson()
          });
        }
      }

      var watcher = compiler.watch({}, callback);

      return watcher.close.bind(watcher);
    });
  });
}

/**
 * @private
 */

function addDevServerToEntryMapperCreator(devServerConfigFilepath) {
  return function (webpackConfig$) {
    return webpackConfig$.map(function (it) {
      if (it.webpackConfigFilepath === devServerConfigFilepath) {
        var _ret = (function () {
          var webpackConfig = it.webpackConfig;
          var devServer = webpackConfig.devServer;

          var inlineDevServerChunkList = [require.resolve("webpack-dev-server/client/") + ("?http://" + devServer.host + ":" + devServer.port), "webpack/hot/dev-server"];

          return {
            v: _extends({}, it, {
              webpackConfig: _extends({}, webpackConfig, {
                reacthtmlpackDevServer: true,
                entry: _lodash2["default"].mapValues(webpackConfig.entry, function (filepathList) {
                  return inlineDevServerChunkList.concat(filepathList);
                }),
                plugins: [].concat(_toConsumableArray(webpackConfig.plugins), [new _webpack2["default"].HotModuleReplacementPlugin()])
              })
            })
          };
        })();

        if (typeof _ret === "object") return _ret.v;
      } else {
        return it;
      }
    });
  };
}

/**
 * @private
 */

function startDevServerWithMultiCompiler$ToChildrenStats$MapperCreator(devServerConfigFilepath) {
  return function (webpackCompiler$) {
    return webpackCompiler$.selectMany(function (webpackCompiler) {
      var _webpackCompiler$compilers$filter$map = webpackCompiler.compilers.filter(function (compiler) {
        return compiler.options.reacthtmlpackDevServer;
      }).map(function (compiler) {
        return compiler.options.devServer;
      });

      var _webpackCompiler$compilers$filter$map2 = _slicedToArray(_webpackCompiler$compilers$filter$map, 1);

      var devServer = _webpackCompiler$compilers$filter$map2[0];

      var wDS = new _webpackDevServer2["default"](webpackCompiler, devServer);

      return _rx.Observable.create(function (observer) {
        wDS.listen(devServer.port, devServer.host, function (err) {
          if (err) {
            observer.onError(err);
          }
        });

        webpackCompiler.plugin("done", function (multiStats) {
          observer.onNext(_rx.Observable.fromArray(multiStats.stats).map(function (stats) {
            return { stats: stats, statsJson: stats.toJson() };
          }));
        });
      });
    });
  };
}

// @package