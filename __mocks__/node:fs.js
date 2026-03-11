'use strict'
const { Readable } = require('node:stream')

const fs = jest.createMockFromModule('node:fs')

const mockContent = {}

/**
 * Set the mock file content for a given path
 * @param {string} mockPath - The file path
 * @param {string|Buffer} mockFileContent - The content to return when reading
 */
function __setMockFileContent (mockPath, mockFileContent) {
  mockContent[mockPath] = mockFileContent
}

/**
 * Create a readable stream that emits the mocked file content
 * @param {string} path - The file path requested
 * @returns {Readable} - Readable stream of the file content or error stream if not found
 */
function createReadStream (path) {
  const content = mockContent[path]

  if (content === undefined) {
    const errorStream = new Readable({
      read () {
        this.destroy(new Error(`ENOENT: no such file or directory, open '${path}'`))
      }
    })
    return errorStream
  }

  let sent = false
  return new Readable({
    read () {
      if (!sent) {
        this.push(typeof content === 'string' || Buffer.isBuffer(content) ? content : Buffer.from(''))
        sent = true
      } else {
        this.push(null)
      }
    }
  })
}

const writeFileSync = jest.fn()

fs.createReadStream = createReadStream
fs.writeFileSync = writeFileSync
fs.__setMockFileContent = __setMockFileContent

module.exports = fs
