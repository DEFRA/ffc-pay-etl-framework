const { expect } = require('@jest/globals')
const { PostgresDestination } = require('../../src/destinations')
const { Readable } = require('node:stream')
const { Sequelize } = require('sequelize')

jest.mock("sequelize", () => ({
        Sequelize: jest.fn().mockImplementation(()=> {
            return {
                authenticate: jest.fn().mockResolvedValue(true),
                query: jest.fn().mockResolvedValue([[],1])
            }
        })
    })
)

Sequelize.prototype.authenticate = jest.fn()

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    open: jest.fn().mockReturnValue({ fd : 1 })
}))

const buildPostgresDestination = () => {
    return PostgresDestination({
        username: "postgres",
        password : "abc",
        database: "etl_db",
        host: "postgres",
        table: "target",
        includeErrors: false,
        mapping: [
            {
                column: "column1",
                targetColumn: "target_column1",
                targetType: "varchar"
            },
            {
                column: "column2",
                targetColumn: "target_column2",
                targetType: "varchar"
            },
            {
                column: "column3",
                targetColumn: "target_column3",
                targetType: "varchar"
            },
        ]
    })
}

describe('postgresDestination tests', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it('should write a row', (done) => {
        const uut = buildPostgresDestination()
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .on("data", (chunk) => {
                expect(chunk).toEqual((()=> {
                    const result =['a', 'b', 'c']
                    result.errors = []
                    result.rowId = 1
                    result._columns = [ 'column1', 'column2', 'column3' ]
                    result._result = [ [], 1 ]
                    return result
                })())
                done()
            })
    })
    it('should connect to different port', () => {
        PostgresDestination({
            username: "postgres",
            password : "abc",
            database: "etl_db",
            host: "postgres",
            port: 5433,
            table: "target",
            includeErrors: false,
            mapping: [
                {
                    column: "column1",
                    targetColumn: "target_column1",
                    targetType: "varchar"
                },
                {
                    column: "column2",
                    targetColumn: "target_column2",
                    targetType: "varchar"
                },
                {
                    column: "column3",
                    targetColumn: "target_column3",
                    targetType: "varchar"
                },
            ]})
            expect(Sequelize).toBeCalledTimes(1)
            expect(Sequelize).toBeCalledWith(
                "etl_db", 
                "postgres", 
                "abc", 
                {
                    "dialect": "postgres", 
                    "host": "postgres", 
                    "logging": false, 
                    "port": 5433
                }
            )
        }
    )
})