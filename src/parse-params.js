export default () => {
  const script = document.getElementById('tilecloud-script')
  const { apiKey, containerId } = script.dataset
  return { apiKey, containerId }
}
