"use strict"
const { PassThrough, Readable } = require("node:stream")

const fs = jest.createMockFromModule("fs")

let mockFiles = {}
let mockContent = []

function __setMockFiles(newMockFiles){
    mockFiles = newMockFiles
}

function __setMockFileContent(mockPath, mockFileContent){
    mockContent[mockPath] = mockFileContent
}

function createReadStream(path){
    return Readable.from(mockContent[path])
}

const writeFileSync = jest.fn()

fs.createReadStream = createReadStream
fs.writeFileSync = writeFileSync
fs.__setMockFiles = __setMockFiles
fs.__setMockFileContent = __setMockFileContent
module.exports = fs