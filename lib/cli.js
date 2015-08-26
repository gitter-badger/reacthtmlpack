"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.buildToDir = buildToDir;
exports.watchAndBuildToDir = watchAndBuildToDir;
exports.devServer = devServer;
exports.getMatchesFilepath$ = getMatchesFilepath$;
exports.srcPatternToMatchResult = srcPatternToMatchResult;
exports.watchMultiCompiler$ToChildrenStats$ = watchMultiCompiler$ToChildrenStats$;
exports.replaceWithHtmlExt = replaceWithHtmlExt;
exports.matchResultToMatchesFilepathReducer = matchResultToMatchesFilepathReducer;
exports.matchesFilepath$ToFilepath$ = matchesFilepath$ToFilepath$;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
  var matchesFilepath$ = getMatchesFilepath$(srcPatternList);

  return _rx.Observable.of(matchesFilepath$).map(matchesFilepath$ToFilepath$).map(_core.filepath$ToBabelResult$).map(_core.babelResult$ToReactElement$).map(_core.reactElement$ToChunkList$).map(_core.chunkList$ToWebpackConfig$).map(_core.webpackConfig$ToChunkList$).map(_core.chunkList$ToStaticMarkup$).map(function (staticMarkup$) {
    return staticMarkup$.combineLatest(matchesFilepath$, function (_ref, _ref2) {
      var filepath = _ref.filepath;
      var markup = _ref.markup;
      var relativePathByMatch = _ref2.relativePathByMatch;

      var relativePath = relativePathByMatch[filepath];

      return {
        filepath: (0, _path.resolve)(destDir, relativePath),
        markup: markup
      };
    }).selectMany(function (_ref3) {
      var filepath = _ref3.filepath;
      var markup = _ref3.markup;

      return writeFile(filepath, markup);
    });
  }).subscribeOnNext(function (writeFileResult$) {
    writeFileResult$.subscribe(console.log.bind(console), console.error.bind(console), function () {
      console.log("done!");
    });
  });
}

/**
 * @public
 */

function watchAndBuildToDir(destDir, srcPatternList) {
  var matchesFilepath$ = getMatchesFilepath$(srcPatternList);

  return _rx.Observable.of(matchesFilepath$).map(matchesFilepath$ToFilepath$).map(_core.filepath$ToBabelResult$).map(_core.babelResult$ToReactElement$).map(_core.reactElement$ToChunkList$).map(_core.chunkList$ToWebpackConfig$).selectMany(function (webpackConfig$) {
    return _rx.Observable.of(webpackConfig$).map(_core.webpackConfig$ToWebpackCompiler$).combineLatest(webpackConfig$.count(), function (webpackCompiler$, count) {
      return { webpackCompiler$: webpackCompiler$, count: count };
    }).selectMany(function (_ref4) {
      var webpackCompiler$ = _ref4.webpackCompiler$;
      var count = _ref4.count;

      return _rx.Observable.of(webpackCompiler$).map(watchMultiCompiler$ToChildrenStats$).selectMany(_transducersJs.identity).scan(function (acc, _ref5) {
        var index = _ref5.index;
        var statsJson = _ref5.statsJson;

        acc = [].concat(_toConsumableArray(acc));

        acc[index] = statsJson;

        return acc;
      }, new Array(count)).takeWhile(function (acc) {
        return acc.every(_transducersJs.identity);
      }).map(function (acc) {
        return _rx.Observable.fromArray(acc);
      });
    }).map((0, _core.mergeWebpackStats$ToChunkList$WithWebpackConfig$)(webpackConfig$));
  }).map(_core.chunkList$ToStaticMarkup$).map(function (staticMarkup$) {
    return staticMarkup$.combineLatest(matchesFilepath$, function (_ref6, _ref7) {
      var filepath = _ref6.filepath;
      var markup = _ref6.markup;
      var relativePathByMatch = _ref7.relativePathByMatch;

      var relativePath = relativePathByMatch[filepath];

      return {
        filepath: (0, _path.resolve)(destDir, relativePath),
        markup: markup
      };
    }).selectMany(function (_ref8) {
      var filepath = _ref8.filepath;
      var markup = _ref8.markup;

      return writeFile(filepath, markup);
    });
  }).subscribeOnNext(function (writeFileResult$) {
    writeFileResult$.subscribe(console.log.bind(console), console.error.bind(console), function () {
      console.log("done!");
    });
  });
}

/**
 * @public
 */

function devServer(relativeDevServerConfigFilepath, destDir, srcPatternList) {
  var devServerConfigFilepath = (0, _path.resolve)(process.cwd(), relativeDevServerConfigFilepath);
  var matchesFilepath$ = getMatchesFilepath$(srcPatternList);

  return _rx.Observable.of(matchesFilepath$).map(matchesFilepath$ToFilepath$).map(_core.filepath$ToBabelResult$).map(_core.babelResult$ToReactElement$).map(_core.reactElement$ToChunkList$).map(_core.chunkList$ToWebpackConfig$).selectMany(function (webpackConfig$) {
    var devServerConfig$ = webpackConfig$.filter(function (_ref9) {
      var webpackConfigFilepath = _ref9.webpackConfigFilepath;
      return webpackConfigFilepath === devServerConfigFilepath;
    }).map(function (_ref10) {
      var devServer = _ref10.webpackConfig.devServer;
      return devServer;
    }).first();

    return _rx.Observable.combineLatest(webpackConfig$, devServerConfig$, function (it, _ref11) {
      var host = _ref11.host;
      var port = _ref11.port;
      var webpackConfig = it.webpackConfig;

      var inlineDevServerChunkList = [require.resolve("webpack-dev-server/client/") + ("?http://" + host + ":" + port), "webpack/hot/dev-server"];

      return _extends({}, it, {
        webpackConfig: _extends({}, webpackConfig, {
          entry: _lodash2["default"].mapValues(webpackConfig.entry, function (filepathList) {
            return inlineDevServerChunkList.concat(filepathList);
          }),
          plugins: [].concat(_toConsumableArray(webpackConfig.plugins), [new _webpack2["default"].HotModuleReplacementPlugin()])
        })
      });
    }).map(function (it) {
      return _rx.Observable.of(it);
    }).map(_core.webpackConfig$ToWebpackCompiler$).combineLatest(webpackConfig$.count(), function (webpackCompiler$, count) {
      return { webpackCompiler$: webpackCompiler$, count: count };
    }).selectMany(function (_ref12) {
      var webpackCompiler$ = _ref12.webpackCompiler$;
      var count = _ref12.count;

      return _rx.Observable.of(webpackCompiler$).map(function (webpackCompiler$) {
        return _rx.Observable.combineLatest(devServerConfig$, webpackCompiler$, function (devServerConfig, webpackCompiler) {
          var wDS = new _webpackDevServer2["default"](webpackCompiler, devServerConfig);

          return _rx.Observable.create(function (observer) {
            wDS.listen(devServerConfig.port, devServerConfig.host, function (err) {
              if (err) {
                observer.onError(err);
              }
            });

            webpackCompiler.plugin("done", function (stats) {
              observer.onNext(_rx.Observable.fromArray(stats.toJson().children));
            });
          });
        }).selectMany(_transducersJs.identity);
      }).selectMany(_transducersJs.identity);
    }).map((0, _core.mergeWebpackStats$ToChunkList$WithWebpackConfig$)(webpackConfig$));
  }).map(_core.chunkList$ToStaticMarkup$).map(function (staticMarkup$) {
    return staticMarkup$.combineLatest(matchesFilepath$, function (_ref13, _ref14) {
      var filepath = _ref13.filepath;
      var markup = _ref13.markup;
      var relativePathByMatch = _ref14.relativePathByMatch;

      var relativePath = relativePathByMatch[filepath];

      return {
        filepath: (0, _path.resolve)(destDir, relativePath),
        markup: markup
      };
    }).selectMany(function (_ref15) {
      var filepath = _ref15.filepath;
      var markup = _ref15.markup;

      return writeFile(filepath, markup);
    });
  }).subscribeOnNext(function (writeFileResult$) {
    writeFileResult$.subscribe(console.log.bind(console), console.error.bind(console), function () {
      console.log("done!");
    });
  });
}

/**
 * @private
 */

function getMatchesFilepath$(srcPatternList) {
  return _rx.Observable.fromArray(srcPatternList).selectMany(srcPatternToMatchResult).reduce(matchResultToMatchesFilepathReducer, { matches: [], relativePathByMatch: {} }).first();
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

function matchResultToMatchesFilepathReducer(acc, _ref16) {
  var _acc$matches;

  var base = _ref16.base;
  var matches = _ref16.matches;

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

function matchesFilepath$ToFilepath$(matchesFilepath$) {
  return matchesFilepath$.selectMany(function (_ref17) {
    var matches = _ref17.matches;
    return _rx.Observable.fromArray(matches);
  });
}

// @package