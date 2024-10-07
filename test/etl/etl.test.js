const { expect } = require("@jest/globals")
const { Loaders, Destinations } = require("../../src")
const fs = require("fs")
const Etl = require("../../src/lib")

jest.mock('fs')

describe('csvFileDestination tests', () => {
  afterEach(() => {
      jest.resetAllMocks()
  })
  it('should fire finish event', (done) => {
    const testData = [
      "column1, column2, column3\n",
      "1,2,3\n",
      "4,5,6\n"
    ]
    
    const testPath = "someRandomPath"
    fs.__setMockFileContent(testPath, testData)
    const etl = new Etl.Etl()

    etl
    .loader(new Loaders.CSVLoader({path: testPath, columns: ["column1","column2","column3"]}))
    .destination(new Destinations.CSVFileDestination({ 
        fileName: "SoilType_Output.csv", 
        headers: true, 
        includeErrors: false, 
        quotationMarks: true
    }))
    .pump()
    .on('finish', (data) => {
      done()
    })
  })
  it('should fire result event', (done) => {
    const testData = [
      "column1, column2, column3\n",
      "1,2,3\n",
      "4,5,6\n"
    ]
    
    const testPath = "someRandomPath"
    fs.__setMockFileContent(testPath, testData)
    const etl = new Etl.Etl()

    etl
    .loader(new Loaders.CSVLoader({path: testPath, columns: ["column1","column2","column3"]}))
    .destination(new Destinations.CSVFileDestination({ 
        fileName: "SoilType_Output.csv", 
        headers: true, 
        includeErrors: false, 
        quotationMarks: true
    }))
    .pump()
    .on('result', (data) => {
      expect(data[0]).toEqual("4")
      expect(data[1]).toEqual("5")
      expect(data[2]).toEqual("6")
      expect(data['_columns']).toEqual([ 'column1', 'column2', 'column3' ])
      expect(data['_linecount']).toEqual(2)
      expect(data['_rowId']).toEqual(1)
      expect(data['errors']).toEqual([])
      done()
    })
  })
  it('should add a connection to the connections list', () => {
    const etl = new Etl.Etl()
    const connectionName = 'MockConnection'
    const mockConnection = {
      db: {
        query: jest.fn()
      },
      name: connectionName
    }
    etl.connection(mockConnection)
    expect(etl.connectionList.length).toEqual(1)
    expect(etl.connectionList[0].name).toEqual(connectionName)
  })
  it('should execute beforeETL task', () => {
    const etl = new Etl.Etl()
    const connectionName = 'MockConnection'
    const mockConnection = {
      db: {
        query: jest.fn()
      },
      name: connectionName
    }
    const mockTask = {
      setConnection: jest.fn(),
      getConnectionName: jest.fn().mockReturnValue(connectionName)
    }
    etl.connection(mockConnection)
    etl.beforeETL(mockTask)
    expect(mockTask.setConnection).toHaveBeenCalled()
    expect(mockTask.getConnectionName).toHaveBeenCalled()
  })
  it('should throw if no connection found for beforeETL task', () => {
    const etl = new Etl.Etl()
    const connectionName = 'MockConnection'
    const mockTask = {
      setConnection: jest.fn(),
      getConnectionName: jest.fn().mockReturnValue(connectionName)
    }
    try{
      etl.beforeETL(mockTask)
    }catch(e){
      expect(e.message).toEqual('Connection with name MockConnection not found')
    }
    
  })
})