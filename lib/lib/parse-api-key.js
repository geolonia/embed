"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _urlParse2 = _interopRequireDefault(require("url-parse"));

var _querystring = _interopRequireDefault(require("querystring"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var availableHosts = ['tilecloud.io', 'tilecloud.github.io', /^.+\.tilecloud.io$/];

var isKnownHost = function isKnownHost(host) {
  for (var _i = 0, _availableHosts = availableHosts; _i < _availableHosts.length; _i++) {
    var availableHost = _availableHosts[_i];

    if (availableHost === host) {
      return true;
    } else if (availableHost instanceof RegExp && availableHost.test(host)) {
      return true;
    }
  }
};

var _default = function _default(document) {
  var scripts = document.getElementsByTagName('script');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = scripts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var script = _step.value;

      var _urlParse = (0, _urlParse2["default"])(script.src),
          query = _urlParse.query,
          host = _urlParse.host;

      var _qs$parse = _querystring["default"].parse(query.replace(/^\?/, '')),
          key = _qs$parse.key,
          apiKey = _qs$parse.apiKey,
          tilecloud = _qs$parse.tilecloud;

      if (tilecloud === 'true' || isKnownHost(host)) {
        // backward compatibility for <= 0.2.2
        return key || apiKey;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

exports["default"] = _default;