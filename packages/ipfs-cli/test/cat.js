/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { CID } = require('multiformats/cid')
const cli = require('./utils/cli')
const sinon = require('sinon')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const defaultOptions = {
  offset: undefined,
  length: undefined,
  timeout: undefined
}

describe('cat', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      cat: sinon.stub()
    }
  })

  it('should cat a file', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = uint8ArrayFromString('hello world')

    ipfs.cat.withArgs(cid.toString(), defaultOptions).returns([buf])

    const out = await cli(`cat ${cid}`, { ipfs, raw: true })
    expect(out).to.deep.equal(buf)
  })

  it('cat part of a file using `count`', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = uint8ArrayFromString('hello world')

    ipfs.cat.withArgs(cid.toString(), {
      ...defaultOptions,
      offset: 21,
      length: 5
    }).returns([buf])

    const out = await cli('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --count 5', { ipfs, raw: true })
    expect(out).to.deep.equal(buf)
  })

  it('cat part of a file using `length`', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = uint8ArrayFromString('hello world')

    ipfs.cat.withArgs(cid.toString(), {
      ...defaultOptions,
      offset: 21,
      length: 5
    }).returns([buf])

    const out = await cli('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --length 5', { ipfs, raw: true })
    expect(out).to.deep.equal(buf)
  })

  it('cat non-existent file', async () => {
    const err = new Error('wat')
    ipfs.cat.returns(async function * () { // eslint-disable-line require-await,require-yield
      throw err
    }())

    const out = await cli.fail('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/dummy', { ipfs })
    expect(out).to.equal(`${err.message}\n`)
  })

  it('should cat a file with a timeout', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = uint8ArrayFromString('hello world')

    ipfs.cat.withArgs(cid.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).returns([buf])

    const out = await cli(`cat ${cid} --timeout=1s`, { ipfs, raw: true })
    expect(out).to.deep.equal(buf)
  })
})
