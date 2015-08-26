"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.filepath$ToBabelResult$ = filepath$ToBabelResult$;
exports.babelResult$ToReactElement$ = babelResult$ToReactElement$;
exports.reactElement$ToChunkList$ = reactElement$ToChunkList$;
exports.chunkList$ToWebpackConfig$ = chunkList$ToWebpackConfig$;
exports.webpackConfig$ToWebpackCompiler$ = webpackConfig$ToWebpackCompiler$;
exports.webpackCompiler$ToWebpackStats$ = webpackCompiler$ToWebpackStats$;
exports.webpackConfig$ToChunkList$ = webpackConfig$ToChunkList$;
exports.chunkList$ToStaticMarkup$ = chunkList$ToStaticMarkup$;
exports.evaluateAsES2015Module = evaluateAsES2015Module;
exports.fromBabelCodeToReactElement = fromBabelCodeToReactElement;
exports.isEntryType = isEntryType;
exports.entryWithConfigReducer = entryWithConfigReducer;
exports.extractWebpackConfigFilepathList = extractWebpackConfigFilepathList;
exports.toEntryReducer = toEntryReducer;
exports.groupedObsToWebpackConfig = groupedObsToWebpackConfig;
exports.runWebpackCompiler = runWebpackCompiler;
exports.mergeWebpackStats$ToChunkList$WithWebpackConfig$ = mergeWebpackStats$ToChunkList$WithWebpackConfig$;
exports.chunkListWithStats = chunkListWithStats;
exports.entryWithOutputMapper = entryWithOutputMapper;
exports.groupedObsToStaticMarkup = groupedObsToStaticMarkup;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _path = require("path");

var _rx = require("rx");

var _rx2 = _interopRequireDefault(_rx);

var _transducersJs = require("transducers-js");

var _evalAsModule = require("eval-as-module");

var _evalAsModule2 = _interopRequireDefault(_evalAsModule);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _webpack = require("webpack");

var _webpack2 = _interopRequireDefault(_webpack);

var _entryEntryPropTypeKeyList = require("./entry/entryPropTypeKeyList");

var _entryEntryPropTypeKeyList2 = _interopRequireDefault(_entryEntryPropTypeKeyList);

_rx2["default"].config.longStackSupport = true;

// Note babel-core/index.js is NOT a ES6 module
var babel = require("babel-core");

var transformFile = _rx.Observable.fromNodeCallback(babel.transformFile);

var xfFilepath$ToWebpackConfig$ = _transducersJs.comp.apply(undefined, [(0, _transducersJs.map)(filepath$ToBabelResult$), (0, _transducersJs.map)(babelResult$ToReactElement$), (0, _transducersJs.map)(reactElement$ToChunkList$), (0, _transducersJs.map)(chunkList$ToWebpackConfig$)]);

exports.xfFilepath$ToWebpackConfig$ = xfFilepath$ToWebpackConfig$;
/**
 * @public
 */

function filepath$ToBabelResult$(filepath$) {
  return filepath$.selectMany(function (filepath) {
    return transformFile(filepath).map(function (_ref) {
      var code = _ref.code;
      return { filepath: filepath, code: code };
    });
  });
}

/**
 * @public
 */

function babelResult$ToReactElement$(babelResult$) {
  return babelResult$.map(fromBabelCodeToReactElement);
}

/**
 * @public
 */

function reactElement$ToChunkList$(reactElement$) {
  return reactElement$.selectMany(extractWebpackConfigFilepathList);
}

/**
 * @public
 */

function chunkList$ToWebpackConfig$(chunkList$) {
  return chunkList$.groupBy(function (it) {
    return it.webpackConfigFilepath;
  }).selectMany(groupedObsToWebpackConfig);
}

/**
 * @package
 */

function webpackConfig$ToWebpackCompiler$(webpackConfig$) {
  return webpackConfig$.reduce(function (acc, _ref2) {
    var webpackConfig = _ref2.webpackConfig;

    // Your Client config should always be first
    if (webpackConfig.reacthtmlpackDevServer) {
      return [webpackConfig].concat(acc);
    } else {
      return acc.concat(webpackConfig);
    }
  }, []).first().tap(function (webpackConfig) {
    var notMultipleConfig = 2 > webpackConfig.length;
    if (notMultipleConfig) {
      return;
    }

    var _webpackConfig = _slicedToArray(webpackConfig, 1);

    var _webpackConfig$0 = _webpackConfig[0];
    var reacthtmlpackDevServer = _webpackConfig$0.reacthtmlpackDevServer;
    var outputPath = _webpackConfig$0.output.path;

    var notInDevServerMode = !reacthtmlpackDevServer;
    if (notInDevServerMode) {
      return;
    }
    // In devServer command, you have to keep all output.path the same.
    var theyDontHaveTheSameOutputPath = webpackConfig.some(function (it) {
      return it.output.path !== outputPath;
    });
    if (theyDontHaveTheSameOutputPath) {
      throw new Error("Make all your output.path the same in all of your webpack.config.js");
    }
  })
  // The webpackCompiler should be an instance of MultiCompiler
  .map(function (webpackConfig) {
    return (0, _webpack2["default"])(webpackConfig);
  });
}

/**
 * @package
 */

function webpackCompiler$ToWebpackStats$(webpackCompiler$) {
  return webpackCompiler$.selectMany(runWebpackCompiler).selectMany(function (stats) {
    return(
      // See MultiCompiler - MultiStats
      _rx.Observable.fromArray(stats.stats).map(function (stats) {
        return { stats: stats, statsJson: stats.toJson() };
      })
    );
  });
}

/**
 * @public
 */

function webpackConfig$ToChunkList$(webpackConfig$) {
  return _rx.Observable.of(webpackConfig$).map(webpackConfig$ToWebpackCompiler$).map(webpackCompiler$ToWebpackStats$).selectMany(mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$));
}

/**
 * @public
 */

function chunkList$ToStaticMarkup$(chunkList$) {
  return chunkList$.groupBy(function (it) {
    return it.filepath;
  }).selectMany(groupedObsToStaticMarkup);
}

/**
 * @package
 */

function evaluateAsES2015Module(code, filepath) {
  var cjsModule = (0, _evalAsModule2["default"])(code, filepath);
  if (cjsModule.exports && cjsModule.__esModule) {
    return cjsModule.exports;
  } else {
    return {
      "default": cjsModule.exports
    };
  };
}

/**
 * @private
 */

function fromBabelCodeToReactElement(_ref3) {
  var filepath = _ref3.filepath;
  var code = _ref3.code;

  var ComponentModule = evaluateAsES2015Module(code, filepath);
  var element = ComponentModule["default"];
  var doctypeHTML = ComponentModule.doctypeHTML || "<!DOCTYPE html>";

  return {
    filepath: filepath,
    element: element,
    doctypeHTML: doctypeHTML
  };
}

/**
 * @private
 */

function isEntryType(type) {
  return _entryEntryPropTypeKeyList2["default"].every(function (key) {
    return type.propTypes && type.propTypes[key];
  });
}

/**
 * @private
 */

function entryWithConfigReducer(children) {
  var acc = [];

  _react.Children.forEach(children, function (child) {
    if (!_react2["default"].isValidElement(child)) {
      return;
    }
    if (isEntryType(child.type)) {
      var _child$props = child.props;
      var chunkName = _child$props.chunkName;
      var chunkFilepath = _child$props.chunkFilepath;
      var configFilepath = _child$props.configFilepath;

      acc.push({
        chunkName: chunkName,
        chunkFilepath: chunkFilepath,
        configFilepath: configFilepath
      });
    }
    acc.push.apply(acc, _toConsumableArray(entryWithConfigReducer(child.props.children)));
  });

  return acc;
}

/**
 * @private
 */

function extractWebpackConfigFilepathList(_ref4) {
  var filepath = _ref4.filepath;
  var element = _ref4.element;
  var doctypeHTML = _ref4.doctypeHTML;

  var entryWithConfigList = entryWithConfigReducer(element.props.children);

  return _rx.Observable.fromArray(entryWithConfigList).map(function (_ref5) {
    var chunkName = _ref5.chunkName;
    var chunkFilepath = _ref5.chunkFilepath;
    var configFilepath = _ref5.configFilepath;

    return {
      filepath: filepath,
      element: element,
      doctypeHTML: doctypeHTML,
      chunkName: chunkName,
      chunkFilepath: chunkFilepath,
      webpackConfigFilepath: (0, _path.resolve)((0, _path.dirname)(filepath), configFilepath)
    };
  });
}

/**
 * @private
 */

function toEntryReducer(acc, item) {
  var chunkName = item.chunkName;
  var chunkFilepath = item.chunkFilepath;

  if (!acc.entry.hasOwnProperty(chunkName)) {
    acc.entry[chunkName] = chunkFilepath;
    acc.chunkList.push(item);
  }
  return acc;
}

/**
 * @private
 */

function groupedObsToWebpackConfig(groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  var webpackConfigFilepath = groupedObservable.key;

  return groupedObservable.reduce(toEntryReducer, { entry: {}, chunkList: [] }).first().map(function (_ref6) {
    var entry = _ref6.entry;
    var chunkList = _ref6.chunkList;

    return {
      webpackConfigFilepath: webpackConfigFilepath,
      chunkList: chunkList,
      webpackConfig: _extends({}, require(webpackConfigFilepath), {
        entry: entry
      })
    };
  });
}

/**
 * @private
 */

function runWebpackCompiler(compiler) {
  return _rx.Observable.fromNodeCallback(compiler.run.bind(compiler))();
}

/**
 * @package
 */

function mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$) {
  return function (webpackStats$) {
    return _rx.Observable.zip(webpackStats$, webpackConfig$, function (_ref7, _ref8) {
      var stats = _ref7.stats;
      var statsJson = _ref7.statsJson;
      var chunkList = _ref8.chunkList;
      return { chunkList: chunkList, stats: stats, statsJson: statsJson };
    }).selectMany(chunkListWithStats);
  };
}

/**
 * @private
 */

function chunkListWithStats(_ref9) {
  var chunkList = _ref9.chunkList;
  var stats = _ref9.stats;
  var statsJson = _ref9.statsJson;

  return _rx.Observable.fromArray(chunkList).map(function (it) {
    var outputAssetList = [].concat(statsJson.assetsByChunkName[it.chunkName]).map(function (assetName) {
      return {
        rawAsset: stats.compilation.assets[assetName],
        publicFilepath: "" + statsJson.publicPath + assetName
      };
    });

    return _extends({}, it, {
      outputAssetList: outputAssetList
    });
  });
}

/**
 * @private
 */

function entryWithOutputMapper(children, outputAssetListByChunkName) {
  return _react.Children.map(children, function (child) {
    if (!_react2["default"].isValidElement(child)) {
      return child;
    }
    var _child$props2 = child.props;
    var chunkName = _child$props2.chunkName;
    var children = _child$props2.children;

    var extraProps = {
      children: entryWithOutputMapper(children, outputAssetListByChunkName)
    };

    if (isEntryType(child.type)) {
      extraProps.outputAssetList = outputAssetListByChunkName[chunkName];
    }

    return _react2["default"].cloneElement(child, extraProps);
  });
}

/**
 * @private
 */

function groupedObsToStaticMarkup(groupedObservable) {
  // http://requirebin.com/?gist=fe2c7d8fe7083d8bcd2d
  return groupedObservable.reduce(function (acc, item) {
    var chunkName = item.chunkName;
    var outputAssetList = item.outputAssetList;

    acc.outputAssetListByChunkName[chunkName] = outputAssetList;
    acc.filepath = item.filepath;
    acc.element = item.element;
    acc.doctypeHTML = item.doctypeHTML;

    return acc;
  }, { outputAssetListByChunkName: {} }).first().map(function (_ref10) {
    var outputAssetListByChunkName = _ref10.outputAssetListByChunkName;
    var filepath = _ref10.filepath;
    var element = _ref10.element;
    var doctypeHTML = _ref10.doctypeHTML;

    var clonedElement = _react2["default"].cloneElement(element, {
      children: entryWithOutputMapper(element.props.children, outputAssetListByChunkName)
    });

    var reactHtmlMarkup = _react2["default"].renderToStaticMarkup(clonedElement);
    var markup = "" + doctypeHTML + reactHtmlMarkup;

    return {
      filepath: filepath,
      markup: markup
    };
  });
}