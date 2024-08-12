const { expect } = require("@jest/globals")
const { PostgresDestination } = require("../../src/destinations")
const { Readable } = require("node:stream")
const { Sequelize } = require('sequelize')

jest.mock("sequelize", () => ({
    Sequelize: jest.fn().mockReturnValue({
        authenticate: jest.fn().mockReturnValue(true),
        query: jest.fn().mockReturnValue(Promise.resolve([[],1]))
    })
}))
        
jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    open: jest.fn().mockReturnValue({ fd : 1 })
}))

const buildPostgresDestination = () => {
    return PostgresDestination({
        username: "postgres",
        password : (Math.random() + 1).toString(36).substring(7),
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
                console.log(chunk)
                done()
            })
    })
    it('should connect to different port', () => {
        const mockPassword = (Math.random() + 1).toString(36).substring(7)
        PostgresDestination({
            username: "postgres",
            password : mockPassword,
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
                mockPassword, 
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