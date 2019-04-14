"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mapboxGl = _interopRequireDefault(require("mapbox-gl"));

var _mbglTilecloudControl = _interopRequireDefault(require("@tilecloud/mbgl-tilecloud-control"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var navigationControl = new _mapboxGl["default"].NavigationControl();
var geolocationControl = new _mapboxGl["default"].GeolocateControl();
var tilecloudControl = new _mbglTilecloudControl["default"]();
var _default = [navigationControl, geolocationControl, tilecloudControl];
exports["default"] = _default;