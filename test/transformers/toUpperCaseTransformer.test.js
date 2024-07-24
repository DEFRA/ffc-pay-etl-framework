const { expect } = require("@jest/globals");
const { ToUpperCaseTransformer } = require("../../src/transformers")
const { Readable, PassThrough } = require("node:stream")

describe('toUpperCaseTransformer tests', () => {
    it('should convert a string to upper case', (done) => {
        const uut = ToUpperCaseTransformer({ column: "column2" })
        const testData =["a", "b", "c"]
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
                    expect(chunk[1]).toEqual("B")
                    done()
                    callback(null, chunk)
                }
            })
        )
    });
});