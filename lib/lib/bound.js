"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDisplayed = void 0;

var isDisplayed = function isDisplayed(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$window = options.window,
      window = _options$window === void 0 ? global.window : _options$window,
      _options$document = options.document,
      document = _options$document === void 0 ? global.document : _options$document,
      _options$buffer = options.buffer,
      buffer = _options$buffer === void 0 ? 100 : _options$buffer;
  var documentTop = window.pageYOffset || document.documentElement.scrollTop;
  var documentLeft = window.pageXOffset || document.documentElement.scrollLeft;
  var documentBottom = documentTop + window.innerHeight;
  var documentRight = documentLeft + window.innerWidth;
  var rect = element.getBoundingClientRect();
  var elementTop = documentTop + rect.top + buffer;
  var elementLeft = documentLeft + rect.left + buffer;
  var elementBottom = elementTop + element.offsetHeight - 2 * buffer;
  var elementRight = elementLeft + element.offsetWidth - 2 * buffer;
  return elementTop <= documentBottom && elementRight >= documentLeft && elementLeft <= documentRight && elementBottom >= documentTop;
};

exports.isDisplayed = isDisplayed;