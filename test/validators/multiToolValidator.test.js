const { expect } = require("@jest/globals")
const { Readable, PassThrough } = require("node:stream")
const { MultiToolValidator } = require("../../src/validators")
const validator = require('validator')

jest.mock('validator', () => ({
    isAlphanumeric: jest.fn().mockReturnValue(true),
  }
))

describe('multilToolValidator tests', () => {
    it('should not add any errors if all fields are valid', (done) => {
        const uut = MultiToolValidator(
            { columns: [
                {
                    name: "field_one",
                    validator: "isAlphanumeric",
                    args: {
                            locale: "en-GB",
                            options: {
                                ignore: "-"
                            }
                    }
                }
            ]
            })
        let testData =[["a", "b", "c"], ["-", "e", "f"], ["-", "g", "h"]]
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
                    expect(validator.isAlphanumeric).toBeCalledWith(chunk[0],"en-GB", { ignore: "-"})
                    expect(chunk.errors.length).toEqual(0)
                    rowCount +=1
                    if(rowCount===testData.length)
                        done()
                    callback(null, chunk)
                }
            })
        )
    })
})