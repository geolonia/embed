class GeoloniaMapElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div class="geolonia">'
  }
}
customElements.define('geolonia-map', GeoloniaMapElement)
