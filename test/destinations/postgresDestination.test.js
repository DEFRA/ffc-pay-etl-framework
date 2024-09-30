const { expect } = require('@jest/globals')
const { PostgresDestination } = require('../../src/destinations')
const { Readable } = require('node:stream')
const { Sequelize } = require('sequelize')

jest.mock('sequelize', () => {
    const mockQuery = jest.fn().mockResolvedValue([[], 1])
    return {
        Sequelize: jest.fn(() =>({
                authenticate: jest.fn(),
                query: mockQuery
            })
        )
    }
})

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
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should write a row', (done) => {
        const uut = new PostgresDestination(config)
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
    it('should fire result event', (done) => {
        const uut = new PostgresDestination(config)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut.on('result', (data) => {
                expect(data[0]).toEqual('a')
                expect(data[1]).toEqual('b')
                expect(data[2]).toEqual('c')
                expect(data['errors']).toEqual([])
                expect(data['rowId']).toEqual(1)
                expect(data['_columns']).toEqual([ 'column1', 'column2', 'column3' ])
                expect(data['_result']).toEqual([ [], 1 ])
                done()
            }))
    })
    it('should produce debug output', (done) => {
        const uut = new PostgresDestination(config)
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
        new PostgresDestination({
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
    it('should format a date as specified', (done) => {
        const newConfig = { ...config }
        newConfig.mapping[1].targetType = "date"
        newConfig.mapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const uut = new PostgresDestination(newConfig)
        const testData =["a", "19-06-2024 00:00", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                expect(Sequelize().query).toHaveBeenLastCalledWith("INSERT INTO target (target_column1,target_column2,target_column3) VALUES ('a',to_date('19-06-2024 00:00','DD-MM-YYYY HH24:MI:SS'),'c')")
                done()
            })
            .pipe(uut)
    })
})