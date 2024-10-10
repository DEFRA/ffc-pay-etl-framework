const { expect } = require("@jest/globals")
const { CSVFileDestination } = require("../../src/destinations")
const { Readable } = require("node:stream")
const fs = require("fs")

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    open: jest.fn((mockPath, mockFlags, mockCallback) => mockCallback({},{ fd : 1 }))
  }
))

describe('csvFileDestination tests', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it('should write a csv line', (done) => {
        const uut = CSVFileDestination({
            fileName: "csv.sql", 
            headers: true,
            includeErrors: false
        })
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .on("finish", () => {
                expect(fs.writeFileSync).toBeCalledTimes(2)
                expect(fs.writeFileSync).lastCalledWith(
                    {"fd": 1}, 
                    "\"a\",\"b\",\"c\"\n"
                )
                done()
            })
    })
    it('should execute additional tasks', (done) => {
        const mockTasks = [{
            write: jest.fn()
        }]
        const uut = CSVFileDestination({
            fileName: "csv.sql", 
            headers: true,
            includeErrors: false
        })
        uut.setTasks(mockTasks)
        expect(uut.tasks.length).toEqual(1)
        const testData =["a", "b", "c"]
        testData.errors = []
        testData.rowId = 1
        testData._columns = ["column1", "column2", "column3"]
        const readable = Readable.from([testData])
        readable
            .pipe(uut)
            .on("finish", () => {
                expect(mockTasks[0].write).toHaveBeenCalled()
                expect(mockTasks[0].write).toBeCalledWith(testData)
                done()
            })
    })
    it('should set a connection', () => {
        const connnectionName = "MyConnection"
        const mockConnection = {
          db: {
            query: jest.fn()
          },
          name: connnectionName
        }
        const uut = CSVFileDestination({
            fileName: "csv.sql", 
            headers: true,
            includeErrors: false
        })
        expect(uut.connection).toBeFalsy()
        uut.setConnection(mockConnection)
        expect(uut.connection).toBeTruthy()
      })
      it('should get the connection name', () => {
        const connnectionName = "MyConnection"
        const mockConnection = {
          db: {
            query: jest.fn()
          },
          name: connnectionName
        }
        const uut = CSVFileDestination({
            fileName: "csv.sql", 
            headers: true,
            includeErrors: false
        })
        expect(uut.connection).toBeFalsy()
        uut.setConnection(mockConnection)
        expect(uut.connection).toBeTruthy()
        expect(uut.getConnectionName()).toEqual(connnectionName)
      })
})