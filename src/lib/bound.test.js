import { isDisplayed } from './bound'
import assert from 'assert'

const mockDocument = {
  documentElement: {
    scrollTop: 0,
    scrollLeft: 100,
  },
}

const mockWindow = {
  pageYOffset: 123,
  pageXOffset: 123,
  innerHeight: 3333,
  innerWidth: 1111,
}

const mockElement = {
  getBoundingClientRect: () => ({ top: 123, left: 123 }),
  offsetHeight: 100,
  offsetWidth: 200,
}

describe('check an element is in display', () => {
  it('inside', () => {
    const result = isDisplayed(mockElement, {
      window: mockWindow,
      document: mockDocument,
      buffer: 0,
    })
    assert.equal(result, true)
  })
})
