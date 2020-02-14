import assert from 'assert'
import * as util from './util'

const base = 'https://base.example.com/parent/'

before(() => {
  global.location = { href: base }
})

describe('Tests for util.js', () => {
  it('URL should be detected', () => {
    assert.deepEqual(true, !!util.isURL('http://example.com'))
  })

  it('URL with SSL should be detected', () => {
    assert.deepEqual(true, !!util.isURL('https://example.com'))
  })

  it('Path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/parent/example-path',
      util.isURL('./example-path'),
    )
  })

  it('Parent path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      util.isURL('../example-path'),
    )
  })

  it('Absolute path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      util.isURL('/example-path'),
    )
  })

  it('Name should not be detected', () => {
    assert.deepEqual(false, util.isURL('example.com/hello'))
  })
})
