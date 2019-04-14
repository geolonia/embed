"use strict";

var _bound = require("./bound");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var mockDocument = {
  documentElement: {
    scrollTop: 0,
    scrollLeft: 100
  }
};
var mockWindow = {
  pageYOffset: 123,
  pageXOffset: 123,
  innerHeight: 3333,
  innerWidth: 1111
};
var mockElement = {
  getBoundingClientRect: function getBoundingClientRect() {
    return {
      top: 123,
      left: 123
    };
  },
  offsetHeight: 100,
  offsetWidth: 200
};
describe('check an element is in display', function () {
  it('inside', function () {
    var result = (0, _bound.isDisplayed)(mockElement, {
      window: mockWindow,
      document: mockDocument,
      buffer: 0
    });

    _assert["default"].equal(result, true);
  });
});