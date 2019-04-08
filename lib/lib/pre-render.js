"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.preRender = void 0;

var _mapboxGl = _interopRequireDefault(require("mapbox-gl"));

var _mbglGestureHandling = _interopRequireDefault(require("@tilecloud/mbgl-gesture-handling"));

var _bound = require("./bound");

var _defaultControls = _interopRequireDefault(require("./default-controls"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * ex. start rendering if map.top - screen.bottom < 100px
 * @type {number}
 */
var defaultBuffer = 100; // stores map container ids already rendered to prevent run twice

var onceRendered = {};
/**
 * render map if it in users view
 * @param  {{container:HTMLElement, style: object}} maps          map container element and it's style
 * @param  {object|void}                            renderOptions option for rendering
 * @return {Promise}                                              Promise to all all map has started rendering
 */

var preRender = function preRender(maps, renderOptions) {
  var _ref = renderOptions || {
    buffer: defaultBuffer
  },
      _ref$buffer = _ref.buffer,
      buffer = _ref$buffer === void 0 ? defaultBuffer : _ref$buffer;

  var mapOptionsBase = {
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
    bearing: 0,
    pitch: 0,
    hash: false // normalize

  };

  var _maps = Array.isArray(maps) ? maps : [maps];

  return Promise.all(_maps.map(function (_ref2) {
    var container = _ref2.container,
        style = _ref2.style;
    return new Promise(function (resolve, reject) {
      // define scroll handler
      var onScrollEventHandler = function onScrollEventHandler() {
        var elementId = container.id;

        if (!onceRendered[elementId] && (0, _bound.isDisplayed)(container, {
          buffer: buffer
        })) {
          onceRendered[elementId] = true;
          var map;

          try {
            var lat = parseFloat(container.dataset.lat);
            var lng = parseFloat(container.dataset.lng);
            var zoom = parseFloat(container.dataset.zoom);
            var bearing = parseFloat(container.dataset.bearing);
            var pitch = parseFloat(container.dataset.pitch);
            var hash = (container.dataset.hash || 'false').toUpperCase() === 'TRUE';
            var center = lat && lng ? [lng, lat] : false;
            var gestureHandling = (container.dataset['gesture-handling'] || 'true').toUpperCase() === 'TRUE';

            var mapOptions = _objectSpread({
              style: style
            }, mapOptionsBase, {
              container: container,
              center: center ? center : mapOptionsBase.center,
              bearing: bearing ? bearing : mapOptionsBase.bearing,
              pitch: pitch ? pitch : mapOptionsBase.pitch,
              zoom: zoom || mapOptionsBase.center,
              hash: hash // Getting content should be fire just before initialize the map.

            });

            var content = container.innerHTML.trim();
            container.innerHTML = '';
            map = new _mapboxGl["default"].Map(mapOptions);

            if (gestureHandling) {
              new _mbglGestureHandling["default"]().addTo(map);
            }

            _defaultControls["default"].forEach(function (control) {
              return map.addControl(control);
            });

            map.on('load', function (event) {
              var map = event.target;

              if (center) {
                var marker = new _mapboxGl["default"].Marker().setLngLat(center).addTo(map);

                if (content) {
                  var popup = new _mapboxGl["default"].Popup().setHTML(content);
                  marker.setPopup(popup);
                }
              }
            });
          } catch (e) {
            reject(e);
          } finally {
            // handler should fire once
            window.removeEventListener('scroll', onScrollEventHandler); // check all finished

            resolve(map);
          }
        }
      }; // enable handler


      window.addEventListener('scroll', onScrollEventHandler, false); // detect whether map are already in view

      onScrollEventHandler();
    });
  }));
};

exports.preRender = preRender;
var _default = preRender;
exports["default"] = _default;