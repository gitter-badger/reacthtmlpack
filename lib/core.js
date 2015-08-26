"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.filepath$ToBabelResult$ = filepath$ToBabelResult$;
exports.babelResult$ToReactElement$ = babelResult$ToReactElement$;
exports.reactElement$ToChunkList$ = reactElement$ToChunkList$;
exports.chunkList$ToWebpackConfig$ = chunkList$ToWebpackConfig$;
exports.webpackConfig$ToWebpackCompiler$ = webpackConfig$ToWebpackCompiler$;
exports.webpackCompiler$ToWebpackStats$ = webpackCompiler$ToWebpackStats$;
exports.webpackConfig$ToChunkList$ = webpackConfig$ToChunkList$;
exports.chunkList$ToStaticMarkup$ = chunkList$ToStaticMarkup$;
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

/**
 * @public
 */

function filepath$ToBabelResult$(filepath$) {
  return filepath$.zip(filepath$.selectMany(function (filepath) {
    return transformFile(filepath);
  }), function (filepath, _ref) {
    var code = _ref.code;
    return { filepath: filepath, code: code };
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
  return reactElement$.map(extractWebpackConfigFilepathList).selectMany(_transducersJs.identity);
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
    return acc.concat(webpackConfig);
  }, []).first()
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
    return _rx.Observable.fromArray(stats.toJson().children);
  });
}

/**
 * @public
 */

function webpackConfig$ToChunkList$(webpackConfig$) {
  return _rx.Observable.of(webpackConfig$).map(webpackConfig$ToWebpackCompiler$).map(webpackCompiler$ToWebpackStats$).map(mergeWebpackStats$ToChunkList$WithWebpackConfig$(webpackConfig$)).selectMany(_transducersJs.identity);
}

/**
 * @public
 */

function chunkList$ToStaticMarkup$(chunkList$) {
  return chunkList$.groupBy(function (it) {
    return it.webpackConfigFilepath;
  }).selectMany(groupedObsToStaticMarkup);
}

/**
 * @private
 */

function fromBabelCodeToReactElement(_ref3) {
  var filepath = _ref3.filepath;
  var code = _ref3.code;

  var ComponentModule = (0, _evalAsModule2["default"])(code, filepath);
  var element = ComponentModule.exports;

  return {
    filepath: filepath,
    element: element
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

  var entryWithConfigList = entryWithConfigReducer(element.props.children);

  return _rx.Observable.fromArray(entryWithConfigList).map(function (_ref5) {
    var chunkName = _ref5.chunkName;
    var chunkFilepath = _ref5.chunkFilepath;
    var configFilepath = _ref5.configFilepath;

    return {
      filepath: filepath,
      element: element,
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

  acc.entry[chunkName] = chunkFilepath;
  acc.chunkList.push(item);
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
    return _rx.Observable.zip(webpackStats$, webpackConfig$, function (statsJson, _ref7) {
      var chunkList = _ref7.chunkList;
      return { chunkList: chunkList, statsJson: statsJson };
    }).selectMany(chunkListWithStats);
  };
}

/**
 * @private
 */

function chunkListWithStats(_ref8) {
  var chunkList = _ref8.chunkList;
  var statsJson = _ref8.statsJson;

  return _rx.Observable.fromArray(chunkList).combineLatest(_rx.Observable.of(statsJson), function (it, statsJson) {
    return _extends({ statsJson: statsJson }, it);
  });
}

/**
 * @private
 */

function entryWithOutputMapper(children, outputFilepathByEntryName) {
  return _react.Children.map(children, function (child) {
    if (!_react2["default"].isValidElement(child)) {
      return child;
    }
    var _child$props2 = child.props;
    var chunkName = _child$props2.chunkName;
    var children = _child$props2.children;

    var extraProps = {
      children: entryWithOutputMapper(children, outputFilepathByEntryName)
    };

    if (isEntryType(child.type)) {
      var outputFilepathOrList = outputFilepathByEntryName[chunkName];
      extraProps.outputFilepathList = [].concat(outputFilepathOrList);
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
    var statsJson = item.statsJson;

    acc.outputFilepathByEntryName[chunkName] = statsJson.assetsByChunkName[chunkName];
    acc.filepath = item.filepath;
    acc.element = item.element;

    return acc;
  }, { outputFilepathByEntryName: {} }).first().map(function (_ref9) {
    var outputFilepathByEntryName = _ref9.outputFilepathByEntryName;
    var filepath = _ref9.filepath;
    var element = _ref9.element;

    var clonedElement = _react2["default"].cloneElement(element, {
      children: entryWithOutputMapper(element.props.children, outputFilepathByEntryName)
    });

    var markup = _react2["default"].renderToStaticMarkup(clonedElement);

    return {
      filepath: filepath,
      markup: markup
    };
  });
}