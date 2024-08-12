const { expect } = require("@jest/globals")
const { RequiredValidator } = require("../../src/validators/requiredValidator")
const { Readable, PassThrough } = require("node:stream")

describe('requiredValidator tests', () => {
    it('should not add any errors if all required fields are present', (done) => {
        const uut = RequiredValidator({ columns: [0] })
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    expect(chunk.errors.length).toEqual(0)
                    done()
                    callback(null, chunk)
                }
            })
        )
    })
    it('should add errors for all missing required fields', (done) => {
        const uut = RequiredValidator({ columns: [0, 1] })
        const testData =[undefined, undefined, "c"]
        testData.errors = []
        testData.rowId = 1
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                
                    expect(chunk.errors.length).toEqual(2)
                    expect(chunk.errors[0]).toEqual('Required value is null in column 0')
                    expect(chunk.errors[1]).toEqual('Required value is null in column 1')
                    done()
                    callback(null, chunk)
                }
            })
        )
    })
    it('should use custom error message', (done) => {
        const uut = RequiredValidator({ columns: [0, 1], message: 'Required value cannot be null' })
        const testData =[undefined, "b", "c"]
        testData.errors = []
        testData.rowId = 1
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                
                    expect(chunk.errors.length).toEqual(1)
                    expect(chunk.errors[0]).toEqual('Required value cannot be null in column 0')
                    done()
                    callback(null, chunk)
                }
            })
        )
    })
})