export const isDisplayed = (element, options = {}) => {
  const {
    window = global.window,
    document = global.document,
    buffer = 100,
  } = options

  const documentTop = window.pageYOffset || document.documentElement.scrollTop
  const documentLeft = window.pageXOffset || document.documentElement.scrollLeft
  const documentBottom = documentTop + window.innerHeight
  const documentRight = documentLeft + window.innerWidth

  const rect = element.getBoundingClientRect()
  const elementTop = documentTop + rect.top + buffer
  const elementLeft = documentLeft + rect.left + buffer
  const elementBottom = elementTop + element.offsetHeight - 2 * buffer
  const elementRight = elementLeft + element.offsetWidth - 2 * buffer

  return (
    elementTop <= documentBottom &&
    elementRight >= documentLeft &&
    elementLeft <= documentRight &&
    elementBottom >= documentTop
  )
}
