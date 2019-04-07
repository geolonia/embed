"use strict";

var _parseApiKey = _interopRequireDefault(require("./parse-api-key"));

var _jsdom = require("jsdom");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('parse api key from dom', function () {
  it('should parse with tilecloud flag', function () {
    var mocDocument = new _jsdom.JSDOM("<html><body>\n      <script src=\"https://external.example.com/tilecloud.js?tilecloud=true&apiKey=abc\"></script>\n    </body></html>").window.document;
    var apiKey = (0, _parseApiKey["default"])(mocDocument);

    _assert["default"].equal(apiKey, 'abc');
  });
  describe('known hosts', function () {
    var hosts = ['foo.tilecloud.io', 'tilecloud.github.io'];
    hosts.forEach(function (host) {
      return it("should parse with known host ".concat(host), function () {
        var mocDocument = new _jsdom.JSDOM("<html><body>\n          <script src=\"https://".concat(host, "/tilecloud.js?apiKey=abc\"></script>\n        </body></html>")).window.document;
        var apiKey = (0, _parseApiKey["default"])(mocDocument);

        _assert["default"].equal(apiKey, 'abc');
      });
    });
  });
  describe('known hosts with `key` parameter, not `apiKey`', function () {
    var hosts = ['foo.tilecloud.io', 'tilecloud.github.io'];
    hosts.forEach(function (host) {
      return it("should parse with known host ".concat(host), function () {
        var mocDocument = new _jsdom.JSDOM("<html><body>\n          <script src=\"https://".concat(host, "/tilecloud.js?key=abc\"></script>\n        </body></html>")).window.document;
        var apiKey = (0, _parseApiKey["default"])(mocDocument);

        _assert["default"].equal(apiKey, 'abc');
      });
    });
  });
});
describe('not parse api key from dom', function () {
  it('should not parse with tilecloud flag', function () {
    var mocDocument = new _jsdom.JSDOM("<html><body>\n      <script src=\"https://external.example.com/tilecloud.js?apiKey=abc\"></script>\n    </body></html>").window.document;
    var apiKey = (0, _parseApiKey["default"])(mocDocument);

    _assert["default"].equal(apiKey, void 0);
  });
});