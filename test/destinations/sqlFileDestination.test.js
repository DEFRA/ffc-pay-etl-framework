const { expect } = require("@jest/globals");
const { SQLFileDestination, SQL_MODE } = require("../../src/destinations/sqlFileDestination")
const { Readable, PassThrough } = require("node:stream")
const fs = require("fs");

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
  }
))

describe('sqlFileDestination tests', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it('should write an insert statement', (done) => {
        const uut = SQLFileDestination({
            fileName: "statements.sql", 
            mode: SQL_MODE.INSERT_MODE,
            table: "target_table",
            mapping: [
                {
                    column: "column1",
                    targetColumn: "target_column1",
                    targetType: "string"
                },
                {
                    column: "column2",
                    targetColumn: "target_column2",
                    targetType: "string"
                },
                {
                    column: "column3",
                    targetColumn: "target_column3",
                    targetType: "string"
                },
            ]
        })
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .on("finish", () => {
                expect(fs.writeFileSync).toBeCalledTimes(1)
                expect(fs.writeFileSync).toBeCalledWith(
                    "statements.sql", 
                    "INSERT INTO target_table (target_column1,target_column2,target_column3) VALUES ('a','b','c');\n",
                    {"encoding": "utf8", "flag": "a+"}
                )
                done()
            })
    });
});