const { expect } = require('@jest/globals')
const { PostgresDestination } = require('../../src/destinations')
const { Readable } = require('node:stream')
const { Sequelize } = require('sequelize')
jest.mock('sequelize')

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    open: jest.fn().mockReturnValue({ fd : 1 })
}))

const logSpy = jest.spyOn(process.stderr, 'write')

const config = {
    username: "postgres",
    password : "ppp",
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
}

describe('postgresDestination tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it('should write a row', (done) => {
        const uut = PostgresDestination(config)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                expect(Sequelize().query).toHaveBeenLastCalledWith("INSERT INTO target (target_column1,target_column2,target_column3) VALUES ('a','b','c')")
                done()
            })
            .pipe(uut)
    })
    it('should produce debug output', (done) => {
        const uut = PostgresDestination(config)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', () => {
                expect(logSpy).toBeCalledTimes(3)
                done()
            })
            .pipe(uut)
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