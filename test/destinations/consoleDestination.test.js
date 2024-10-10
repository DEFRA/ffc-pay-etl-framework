const { expect } = require("@jest/globals")
const { ConsoleDestination } = require("../../src/destinations")
const { Readable } = require("node:stream")

const spy = jest.spyOn(console,"log")

describe('consoleDestination tests', () => {
  afterEach(() => {
      jest.resetAllMocks()
  })
  it('should write to the console', (done) => {
    const uut = ConsoleDestination({
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
            expect(spy).toHaveBeenCalledWith(testData)
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
    const uut = ConsoleDestination({
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
    const uut = ConsoleDestination({
      includeErrors: false
    })
    expect(uut.connection).toBeFalsy()
    uut.setConnection(mockConnection)
    expect(uut.connection).toBeTruthy()
    expect(uut.getConnectionName()).toEqual(connnectionName)
  })
  it('should execute additional tasks', (done) => {
    const mockTasks = [{
        write: jest.fn()
    }]
    const uut = ConsoleDestination({
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
})