const { expect } = require("@jest/globals")
const { StringReplaceTransformer } = require("../../src/transformers")
const { Readable, PassThrough } = require("node:stream")

describe('stringReplaceTransformer tests', () => {
    it('should replace a search string with a replacement string', (done) => {
        const uut = StringReplaceTransformer([{ 
          column: "column2",
          find: "'",
          replace: "''"
        }])
        const testData =["a", "o'b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["columm1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    expect(chunk.errors.length).toEqual(0)
                    expect(chunk[1]).toEqual("o''b")
                    done()
                    callback(null, chunk)
                }
            })
        )
    })
})