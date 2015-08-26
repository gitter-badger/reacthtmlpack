"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _core = require("../core");

var ReactRenderToStringEntry = (function (_Component) {
  _inherits(ReactRenderToStringEntry, _Component);

  function ReactRenderToStringEntry() {
    _classCallCheck(this, ReactRenderToStringEntry);

    _get(Object.getPrototypeOf(ReactRenderToStringEntry.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ReactRenderToStringEntry, [{
    key: "render",
    value: function render() {
      var _props = this.props;
      var tagName = _props.tagName;
      var chunkName = _props.chunkName;
      var chunkFilepath = _props.chunkFilepath;
      var configFilepath = _props.configFilepath;
      var outputAssetList = _props.outputAssetList;

      var restProps = _objectWithoutProperties(_props, ["tagName", "chunkName", "chunkFilepath", "configFilepath", "outputAssetList"]);

      if (outputAssetList) {
        var _outputAssetList$filter = outputAssetList.filter(function (_ref) {
          var publicFilepath = _ref.publicFilepath;
          return (/\.js$/.test(publicFilepath)
          );
        });

        var _outputAssetList$filter2 = _slicedToArray(_outputAssetList$filter, 1);

        var rawAsset = _outputAssetList$filter2[0].rawAsset;

        var ComponentModule = (0, _core.evaluateAsES2015Module)(rawAsset.source());

        var markup = {
          __html: _react2["default"].renderToString(_react2["default"].createElement(ComponentModule["default"], null))
        };

        return _react2["default"].createElement(tagName, _extends({}, restProps, {
          dangerouslySetInnerHTML: markup
        }));
      } else {
        return _react2["default"].createElement("noscript", null);
      }
    }
  }], [{
    key: "propTypes",
    value: {
      tagName: _react.PropTypes.string.isRequired,
      chunkName: _react.PropTypes.string.isRequired,
      chunkFilepath: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]).isRequired,
      configFilepath: _react.PropTypes.string.isRequired,
      // Generated later.
      outputAssetList: _react.PropTypes.arrayOf(_react.PropTypes.shape({
        rawAsset: _react.PropTypes.object.isRequired,
        publicFilepath: _react.PropTypes.string.isRequired
      }))
    },
    enumerable: true
  }]);

  return ReactRenderToStringEntry;
})(_react.Component);

exports["default"] = ReactRenderToStringEntry;
module.exports = exports["default"];