const { CSVLoader } = require("../../src/loaders/csvloader")
const { Readable, PassThrough } = require("node:stream")
const fs = require("fs")
const { expect } = require("@jest/globals")

jest.mock('fs')

describe('csvLoader tests', () => {
    it('should load a csv file', (done) => {
        const testData = [
            "column1, column2, column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ]
        let lineCount = 1
        const testPath = "someRandomPath"
        fs.__setMockFileContent(testPath, testData)
        const uut = CSVLoader({ path: testPath, columns: ["a","b","c"]})
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback){
                    expect(chunk.join(",")).toEqual(testData[lineCount].replace(/\n/,""))
                    if(lineCount === testData.length - 1)
                        done()
                    lineCount +=1
                    callback(null, chunk)
                }
            }))
    })
    it('should count csv file lines', (done) => {
        jest.setTimeout(10000)
        const testData = [
            "column1, column2, column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ]
        let lineCount = 1
        const testPath = "someRandomPath"
        fs.__setMockFileContent(testPath, testData)
        const uut = CSVLoader({ path: testPath, columns: ["a","b","c"]})
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback){
                    expect(chunk._linecount).toEqual(lineCount)
                    if(lineCount === testData.length - 1)
                        done()
                    lineCount +=1
                    callback(null, chunk)
                }
            }))
    })
})