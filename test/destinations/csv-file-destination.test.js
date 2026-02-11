const { expect } = require('@jest/globals')
const { CSVFileDestination } = require('../../app/destinations')
const { Readable } = require('node:stream')
const fs = require('node:fs')

jest.mock('node:fs', () => ({
  writeSync: jest.fn(),
  openSync: jest.fn(() => 1),
  closeSync: jest.fn()
}))

describe('csvFileDestination tests', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should write a csv line', (done) => {
    const uut = CSVFileDestination({
      fileName: 'csv.sql',
      headers: true,
      includeErrors: false,
      quotationMarks: true
    })

    const testData = ['a', 'b', 'c']
    testData.errors = []
    testData.rowId = 1
    testData._columns = ['column1', 'column2', 'column3']

    const readable = Readable.from([testData])

    readable.pipe(uut).on('finish', () => {
      expect(fs.writeSync).toBeCalledTimes(2)
      expect(fs.writeSync).toHaveBeenNthCalledWith(
        1,
        1,
        '"column1","column2","column3"\n'
      )

      expect(fs.writeSync).toHaveBeenNthCalledWith(
        2,
        1,
        '"a","b","c"\n'
      )
      done()
    })
  })

  test('should execute additional tasks', (done) => {
    const mockTasks = [{
      write: jest.fn()
    }]

    const uut = CSVFileDestination({
      fileName: 'csv.sql',
      headers: true,
      includeErrors: false,
      quotationMarks: true
    })
    uut.setTasks(mockTasks)

    expect(uut.tasks.length).toEqual(1)

    const testData = ['a', 'b', 'c']
    testData.errors = []
    testData.rowId = 1
    testData._columns = ['column1', 'column2', 'column3']

    const readable = Readable.from([testData])

    readable.pipe(uut).on('finish', () => {
      expect(mockTasks[0].write).toHaveBeenCalled()
      expect(mockTasks[0].write).toBeCalledWith(testData)
      done()
    })
  })

  test('should set a connection', () => {
    const connectionName = 'MyConnection'
    const mockConnection = {
      db: {
        query: jest.fn()
      },
      name: connectionName
    }

    const uut = CSVFileDestination({
      fileName: 'csv.sql',
      headers: true,
      includeErrors: false,
      quotationMarks: true
    })

    expect(uut.connection).toBeFalsy()
    uut.setConnection(mockConnection)
    expect(uut.connection).toBeTruthy()
  })

  test('should get the connection name', () => {
    const connectionName = 'MyConnection'
    const mockConnection = {
      db: {
        query: jest.fn()
      },
      name: connectionName
    }

    const uut = CSVFileDestination({
      fileName: 'csv.sql',
      headers: true,
      includeErrors: false,
      quotationMarks: true
    })

    expect(uut.connection).toBeFalsy()
    uut.setConnection(mockConnection)
    expect(uut.connection).toBeTruthy()
    expect(uut.getConnectionName()).toEqual(connectionName)
  })
})
