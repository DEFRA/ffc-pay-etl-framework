'use strict'
const { Readable } = require('node:stream')

const fs = jest.createMockFromModule('fs')

const mockContent = []

function __setMockFileContent (mockPath, mockFileContent) {
  mockContent[mockPath] = mockFileContent
}

function createReadStream (path) {
  return Readable.from(mockContent[path])
}

const writeFileSync = jest.fn()

fs.createReadStream = createReadStream
fs.writeFileSync = writeFileSync
fs.__setMockFileContent = __setMockFileContent
module.exports = fs
