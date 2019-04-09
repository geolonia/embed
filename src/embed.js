/**
 * @file Entry for tilecloud.js
 */

import '@babel/polyfill'
import 'intersection-observer'
import 'mapbox-gl/dist/mapbox-gl.css'
import render from './lib/render'

const observer = new IntersectionObserver((entries) => {
  entries.forEach((item) => {
    if (!item.isIntersecting) {
      return;
    }

    render(item.target)
    observer.unobserve(item.target)
  })
});

const containers = document.querySelectorAll('.tilecloud');

containers.forEach((container) => {
  observer.observe(container);
});
