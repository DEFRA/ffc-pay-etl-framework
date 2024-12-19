const fs = require('fs')
const { PassThrough } = require('stream')
const { CSVLoader } = require('../../src/loaders/csvloader')

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
        fs.__setMockFileContent(testPath, testData.join(''))
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

    it('should remove non-printable characters from CSV data', (done) => {
        const testData = [
            "column1,column2,column3\n",
            "1,\x00\x1F2,3\n",
            "4,5,\x7F\x9F6\n"
        ]
        const expectedData = [
            "column1,column2,column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ]
        let lineCount = 1
        const testPath = "someRandomPath"
        fs.__setMockFileContent(testPath, testData.join(''))
        const uut = CSVLoader({ path: testPath, columns: ["column1", "column2", "column3"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    try {
                        const received = chunk.join(",")
                        const expected = expectedData[lineCount].replace(/\n/,"")
                        expect(received).toEqual(expected)
                        if (lineCount === expectedData.length - 1) {
                            done()
                        }
                        lineCount += 1
                        callback(null, chunk)
                    } catch (error) {
                        done(error)
                    }
                }
            }))
    }, 10000)
})