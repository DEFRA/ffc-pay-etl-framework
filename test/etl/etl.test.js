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
    .loader(Loaders.CSVLoader({path: testPath, columns: ["column1","column2","column3"]}))
    .destination(Destinations.CSVFileDestination({ 
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
})