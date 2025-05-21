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

    it('should load from a readable stream', (done) => {
        const testData = [
            "column1,column2,column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ].join('')
        const readableStream = new PassThrough()
        readableStream.end(testData)
        let lineCount = 0

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    expect(chunk.join(",")).toEqual(testData.split("\n")[lineCount + 1].replace(/\n/, ""))
                    lineCount += 1
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    })

    it('should count lines from a readable stream', (done) => {
        const testData = [
            "column1,column2,column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ].join('')
        const readableStream = new PassThrough()
        readableStream.end(testData)
        let lineCount = 1

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    expect(chunk._linecount).toEqual(lineCount)
                    lineCount += 1
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    })

    it('should remove non-printable characters from CSV data from a stream', (done) => {
        const testData = [
            "column1,column2,column3\n",
            "1,\x00\x1F2,3\n",
            "4,5,\x7F\x9F6\n"
        ].join('')
        const expectedData = [
            "column1,column2,column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ]
        const readableStream = new PassThrough()
        readableStream.end(testData)
        let lineCount = 0

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    const received = chunk.join(",")
                    const expected = expectedData[lineCount + 1].replace(/\n/, "") 
                    expect(received).toEqual(expected)
                    lineCount += 1
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    }, 10000)

    it('should start processing from the specified starting line', (done) => {
        const testData = [
            "2",
            "column1,column2,column3\n",
            "1,2,3\n",
            "4,5,6\n"
        ].join('')
        const expectedData = [
            "1,2,3\n",
            "4,5,6\n"
        ]
        let lineCount = 0
        const readableStream = new PassThrough()
        readableStream.end(testData)

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"], startingLine: 2 })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    const received = chunk.join(",")
                    const expected = expectedData[lineCount].replace(/\n/, "")
                    expect(received).toEqual(expected)
                    lineCount += 1
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    }, 10000)

    it('should handle relaxed quote parsing', (done) => {
        const testData = [
            'column1,column2,column3\n',
            '1,"2,3",4\n',
            '5,"6,7",8\n'
        ].join('')
        const expectedData = [
            '1,2,3,4',
            '5,6,7,8'
        ]
        const readableStream = new PassThrough()
        readableStream.end(testData)
        let lineCount = 0

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"], relax: true })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    expect(chunk.join(",")).toEqual(expectedData[lineCount])
                    lineCount += 1
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                expect(lineCount).toBe(2)
                done()
            })
    }, 10000)

    it('should handle empty CSV', (done) => {
        const testData = ''
        const readableStream = new PassThrough()
        readableStream.end(testData)

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    // This should not be called
                    expect(true).toBe(false)
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    })

    it('should handle CSV with only headers', (done) => {
        const testData = 'column1,column2,column3\n'
        const readableStream = new PassThrough()
        readableStream.end(testData)

        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        uut
            .pump(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk, _, callback) {
                    // This should not be called
                    expect(true).toBe(false)
                    callback(null, chunk)
                }
            }))
            .on('finish', () => {
                done()
            })
    })

    it('should emit error if parser fails', (done) => {
        const testData = [
            'column1,column2,column3\n',
            '1,"2,3,4\n'
        ].join('')
        const readableStream = new PassThrough()
        readableStream.end(testData)
    
        // Handler for uncaught exceptions
        const uncaughtHandler = (err) => {
            expect(err).toBeDefined()
            expect(err.message).toMatch(/Quote Not Closed|Quoted field not terminated|Invalid Closing Quote/)
            process.off('uncaughtException', uncaughtHandler)
            done()
        }
        process.on('uncaughtException', uncaughtHandler)
    
        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        const stream = uut.pump(uut)
    
        let errorHandled = false
    
        uut.on('error', (err) => {
            errorHandled = true
            expect(err).toBeDefined()
            expect(err.message).toMatch(/Quote Not Closed|Quoted field not terminated|Invalid Closing Quote/)
            process.off('uncaughtException', uncaughtHandler)
            done()
        })
    
        stream.on('end', () => {
            if (!errorHandled) {
                process.off('uncaughtException', uncaughtHandler)
                done(new Error('Expected error was not emitted'))
            }
        })
    
        stream.pipe(new PassThrough({
            objectMode: true,
            transform(chunk, _, callback) {
                callback(null, chunk)
            }
        }))
    })

       it('should emit error if transformer throws', (done) => {
        const testData = [
            "column1,column2,column3\n",
            "1,2,3\n"
        ].join('')
        const readableStream = new PassThrough()
        readableStream.end(testData)
    
        const uut = CSVLoader({ stream: readableStream, columns: ["column1", "column2", "column3"] })
        const stream = uut.pump(uut)
    
        const errorHandler = (err) => {
            expect(err).toBeDefined()
            expect(err.message).toMatch(/Transformer error/)
            done()
        }
    
        const erroringStream = new PassThrough({
            objectMode: true,
            transform(chunk, _, callback) {
                callback(new Error('Transformer error'))
            }
        })
        erroringStream.on('error', errorHandler)
    
        stream.pipe(erroringStream)
    })
})
