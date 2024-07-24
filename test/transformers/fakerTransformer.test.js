const { expect } = require("@jest/globals");
const { FakerTransformer } = require("../../src/transformers")
const { Readable, PassThrough } = require("node:stream")

describe('fakerTransformer tests', () => {
    it('should convert a value to a fake', (done) => {
        const uut = FakerTransformer({ 
            columns: [
                {
                    name: "column2",
                    faker: "company.name"
                }
            ]
        })
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .pipe(new PassThrough({
                objectMode: true,
                transform(chunk,_,callback){
                    expect(chunk.errors.length).toEqual(0)
                    expect(chunk[1]).not.toEqual("B")
                    done()
                    callback(null, chunk)
                }
            })
        )
    });
});