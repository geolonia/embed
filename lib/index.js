"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preRender = exports.isDisplayed = void 0;

var _bound = require("./lib/bound");

var _preRender2 = _interopRequireDefault(require("./lib/pre-render"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @file entory for npm distribution
 */
var isDisplayed = _bound.isDisplayed;
exports.isDisplayed = isDisplayed;
var preRender = _preRender2["default"];
exports.preRender = preRender;