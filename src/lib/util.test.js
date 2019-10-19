import assert from 'assert'
import * as util from './util'

describe('Tests for util.js', () => {
  it('URL should be detected', () => {
    assert.deepEqual(true, util.isURL('http://example.com'))
  })

  it('URL with SSL should be detected', () => {
    assert.deepEqual(true, util.isURL('https://example.com'))
  })

  it('Path should be detected', () => {
    assert.deepEqual(true, util.isURL('./example.com'))
  })

  it('Parent path should be detected', () => {
    assert.deepEqual(true, util.isURL('../example.com'))
  })

  it('Absolute path should be detected', () => {
    assert.deepEqual(true, util.isURL('/example.com'))
  })

  it('Name should not be detected', () => {
    assert.deepEqual(false, util.isURL('example.com/hello'))
  })
})
