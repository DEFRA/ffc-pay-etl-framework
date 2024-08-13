const { expect } = require("@jest/globals")
const { Readable, PassThrough } = require("node:stream")
const { UniqueValidator } = require("../../src/validators/uniqueValidator")

describe('uniqueValidator tests', () => {
    it('should not add any errors if all fields are unique', (done) => {
        const uut = UniqueValidator({ column: "field_one" })
        let testData =[["a", "b", "c"], ["d", "e", "f"]]
        testData = testData.map((td, index) => {
            td.errors = []
            td.rowId = index
            td._columns = ["field_one", "field_two", "field_three"]
            return td    
        })
        const readable = Readable.from(testData)
        let rowCount = 0
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    expect(chunk.errors.length).toEqual(0)
                    rowCount +=1
                    if(rowCount===testData.length)
                        done()
                    callback(null, chunk)
                }
            })
        )
    })
    it('should add errors if specified field is not unique', (done) => {
        const uut = UniqueValidator({ column: "field_one" })
        let testData =[["a", "b", "c"], ["a", "e", "f"]]
        testData = testData.map((td, index) => {
            td.errors = []
            td.rowId = index
            td._columns = ["field_one", "field_two", "field_three"]
            return td    
        })
        const readable = Readable.from(testData)
        let rowCount = 0
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    if(rowCount === 1){
                        expect(chunk.errors.length).toEqual(1)
                        expect(chunk.errors[0]).toEqual('Expected unique value is not unique field_one')
                    }
                    rowCount +=1
                    if(rowCount===testData.length)
                        done()
                    callback(null, chunk)
                }
            })
        )
    })
    it('should use custom error message', (done) => {
        const uut = UniqueValidator({ column: "field_one", message: "Field is not unique"  })
        let testData =[["a", "b", "c"], ["a", "e", "f"]]
        testData = testData.map((td, index) => {
            td.errors = []
            td.rowId = index
            td._columns = ["field_one", "field_two", "field_three"]
            return td    
        })
        const readable = Readable.from(testData)
        let rowCount = 0
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    if(rowCount === 1){
                        expect(chunk.errors.length).toEqual(1)
                        expect(chunk.errors[0]).toEqual('Field is not unique field_one')
                    }
                    rowCount +=1
                    if(rowCount===testData.length)
                        done()
                    callback(null, chunk)
                }
            })
        )
    })
})