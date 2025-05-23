const { expect } = require('@jest/globals')
const { 
    PostgresDestination, writeInsertStatement, hasReturningColumns,
    getReturningColumns, getMappingForColumn
} = require('../../src/destinations/postgresDestination')
const { Readable } = require('node:stream')

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

const mockConnection = {
    name: 'Mock Connection',
    db: {
        query: jest.fn().mockResolvedValue([[],1])
    }
}

describe('postgresDestination tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should write a row', (done) => {
        const uut = new PostgresDestination(config)
        uut.setConnection(mockConnection)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                expect(mockConnection.db.query).toHaveBeenLastCalledWith(`INSERT INTO public."target" ("target_column1","target_column2","target_column3") VALUES ('a','b','c')`)
                done()
            })
            .pipe(uut)
    })
    it('should fail to write a row', (done) => {
        const uut = new PostgresDestination(config)
        uut.setConnection({
            name: 'Mock Connection',
            db: {
                query: jest.fn().mockResolvedValue(Promise.reject())
            }
        })
        
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                done()
            })
            .pipe(uut)
    })
    it('should fire result event', (done) => {
        // This test was working fine until today
        const uut = new PostgresDestination(config)
        uut.setConnection(mockConnection)
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
        // This test was working fine until today
        const uut = new PostgresDestination(config)
        uut.setConnection(mockConnection)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', () => {
                expect(logSpy).toBeCalledTimes(2)
                done()
            })
            .pipe(uut)
    })
    it('should format a date as specified', (done) => {
        const newConfig = JSON.parse(JSON.stringify(config))
        newConfig.mapping[1].targetType = "date"
        newConfig.mapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const uut = new PostgresDestination(newConfig)
        uut.setConnection(mockConnection)
        const testData =["a", "19-06-2024 00:00", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                expect(mockConnection.db.query).toHaveBeenLastCalledWith(`INSERT INTO public."target" ("target_column1","target_column2","target_column3") VALUES ('a',to_timestamp('19-06-2024 00:00','DD-MM-YYYY HH24:MI:SS'),'c')`)
                done()
            })
            .pipe(uut)
    })
    it('should write a sql statement', () => {
        const mockTable = "MockTable"
        const mockChunk = ["a", "19-06-2024 00:00", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(config.mapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a','19-06-2024 00:00','c')`)
    })
    it('should write a sql statement with schema if provided', () => {
        const mockTable = "MockTable"
        const mockChunk = ["a", "19-06-2024 00:00", "c"]
        const mockSchema = 'mydatabase123'
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(config.mapping, mockTable, mockChunk, mockSchema)
        expect(result).toEqual(`INSERT INTO mydatabase123."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a','19-06-2024 00:00','c')`)
    })
    it('should write a sql statement with a date format', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].targetType = "date"
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", "19-06-2024 00:00", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a',to_timestamp('19-06-2024 00:00','DD-MM-YYYY HH24:MI:SS'),'c')`)
    })
    it('should write a sql statement correctly if date but no value', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].targetType = "date"
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", "", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a','','c')`)
    })
    it('should write a sql statement when a target column is a keyword', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].targetColumn = "User"
        newMapping[1].targetType = "date"
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", "19-06-2024 00:00", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1",\"User\","target_column3") VALUES ('a',to_timestamp('19-06-2024 00:00','DD-MM-YYYY HH24:MI:SS'),'c')`)
    })
    it('should write a sql statement when a source column is a keyword and there is no target column', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].column = "User"
        newMapping[1].targetType = "date"
        delete newMapping[1].targetColumn
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", "19-06-2024 00:00", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "User", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1",\"User\","target_column3") VALUES ('a',to_timestamp('19-06-2024 00:00','DD-MM-YYYY HH24:MI:SS'),'c')`)
    })
    it('should write a sql statement when a target column type is a number', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].targetType = "number"
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", 999, "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a',999,'c')`)
    })
    it('should write a sql statement when a target column type is a number but the value is NaN', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].targetType = "number"
        newMapping[1].format = "DD-MM-YYYY HH24:MI:SS"
        const mockTable = "MockTable"
        const mockChunk = ["a", "a999", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a',0,'c')`)
    })
    it('should write a sql statement when a target column has the returning flag set', () => {
        const newMapping = JSON.parse(JSON.stringify(config.mapping))
        newMapping[1].returning = true
        const mockTable = "MockTable"
        const mockChunk = ["a", "a999", "c"]
        mockChunk.errors = []
        mockChunk.rowId = 1
        mockChunk._columns = ["column1", "column2", "column3"]
        const result = writeInsertStatement(newMapping, mockTable, mockChunk)
        expect(result).toEqual(`INSERT INTO public."MockTable" ("target_column1","target_column2","target_column3") VALUES ('a','a999','c') RETURNING target_column2`)
    })
    it('should fire off any addtional tasks', (done) => {
        const mockTasks = [{
            write: jest.fn()
        }]
        const uut = new PostgresDestination(config)
        uut.setConnection(mockConnection)
        uut.setTasks(mockTasks)
        expect(uut.tasks.length).toEqual(1)
        const testData =["a", "b", "c"]

        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .on('close', (result) => {
                expect(mockConnection.db.query).toHaveBeenLastCalledWith(`INSERT INTO public."target" ("target_column1","target_column2","target_column3") VALUES ('a','b','c')`)
                expect(mockTasks[0].write).toHaveBeenCalled()
                expect(mockTasks[0].write).toBeCalledWith(testData)
                done()
            })
            .pipe(uut)      
    })
    it('should get connection name', () => {
        const uut = new PostgresDestination(config)
        uut.setConnection(mockConnection)
        expect(uut.getConnectionName()).toEqual(mockConnection.name)
    })
    it('should return true if mapping contains one or more mappings that have the returning flag set', () => {
        const newConfig = JSON.parse(JSON.stringify(config))
        newConfig.mapping[0].returning = true
        expect(hasReturningColumns(newConfig.mapping)).toEqual(true)
    })
    it('should return false if mapping does not contain one or more mappings that have the returning flag set', () => {
        const newConfig = JSON.parse(JSON.stringify(config))
        expect(hasReturningColumns(newConfig.mapping)).toEqual(false)
    })
    it('should return array of mappings that have the returning flag set', () => {
        const newConfig = JSON.parse(JSON.stringify(config))
        newConfig.mapping[0].returning = true
        expect(getReturningColumns(newConfig.mapping)).toEqual(['target_column1'])
    })

    describe('writeInsertStatement', () => {
        const columnMapping = [
            { column: 'id', targetColumn: 'id', targetType: 'number' },
            { column: 'name', targetColumn: 'name', targetType: 'varchar' },
            { column: 'created_at', targetColumn: 'created_at', targetType: 'date', format: 'YYYY-MM-DD' }
        ]
        const table = 'test_table'
        const schema = 'public'
        const chunk = {
            _columns: ['id', 'name', 'created_at'],
            0: 1,
            1: 'test',
            2: '2025-04-07'
        }

        test('should handle no ignoredColumns provided', () => {
            const statement = writeInsertStatement(columnMapping, table, chunk, schema)
            expect(statement).toContain('INSERT INTO public."test_table" ("id","name","created_at") VALUES (1,\'test\',to_timestamp(\'2025-04-07\',\'YYYY-MM-DD\'))')
        })

        test('should handle ignoredColumns provided', () => {
            const ignoredColumns = ['name']
            const statement = writeInsertStatement(columnMapping, table, chunk, schema, ignoredColumns)
            expect(statement).toContain('INSERT INTO public."test_table" ("id","created_at") VALUES (1,to_timestamp(\'2025-04-07\',\'YYYY-MM-DD\'))')
        })

        test('should handle mixed columns', () => {
            const ignoredColumns = ['id']
            const statement = writeInsertStatement(columnMapping, table, chunk, schema, ignoredColumns)
            expect(statement).toContain('INSERT INTO public."test_table" ("name","created_at") VALUES (\'test\',to_timestamp(\'2025-04-07\',\'YYYY-MM-DD\'))')
        })

        test('should handle all columns ignored', () => {
            const ignoredColumns = ['id', 'name', 'created_at']
            const statement = writeInsertStatement(columnMapping, table, chunk, schema, ignoredColumns)
            expect(statement).toContain('INSERT INTO public."test_table" () VALUES ()')
        })

        test('should handle case sensitivity', () => {
            const ignoredColumns = ['NAME']
            const statement = writeInsertStatement(columnMapping, table, chunk, schema, ignoredColumns)
            expect(statement).toContain('INSERT INTO public."test_table" ("id","name","created_at") VALUES (1,\'test\',to_timestamp(\'2025-04-07\',\'YYYY-MM-DD\'))')
        })
    })
})