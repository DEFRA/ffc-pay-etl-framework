const { PostgresSQLTask, getPlaceHolders, doPlaceHolderValueInterpolations } = require('../../src/misc/postgresSQLTask.js')
const { expect } = require("@jest/globals")

const mockConnection = {
  db: {
    query: jest.fn()
  }
}

describe('PostgresSQLTask tests', () => {
  it('should execute plain sql', (done) => {
    const sql = "INSERT INTO Foo(bar,baz) VALUES (1,2);"
    const uut = new PostgresSQLTask({ sql:sql })
    uut.setConnection(mockConnection)
    uut
      .on('data', () => {
        expect(mockConnection.db.query).toHaveBeenCalledWith(sql)
        done()
      })
      .write([1,2,3,4,5])
  })
  it('should get column name placeholders and character positions', () => {
    const sql = "INSERT INTO Foo(bar,baz) VALUES (${columns.column1},${columns.column2});"
    const uut = getPlaceHolders
    const matches = uut(sql)
    expect(matches[0].value).toEqual('column1')
    expect(matches[0].collection).toEqual('columns')
    expect(matches[0].startPos).toEqual(32)
    expect(matches[0].endPos).toEqual(49)
    expect(matches[1].value).toEqual('column2')
    expect(matches[1].collection).toEqual('columns')
    expect(matches[1].startPos).toEqual(51)
    expect(matches[1].endPos).toEqual(68)
    console.log(matches)
  })
  it('should interpolate column values', () => {
    const mockPlaceHolders = [
      { match: 'columns.column1', value: 'column1', collection: 'columns', startPos: 35, endPos: 50 },
      { match: 'columns.column2', value: 'column2', collection: 'columns', startPos: 54, endPos: 69 }
    ]
    const testData = ["apples","oranges","bananas","cumcwats","dragon fruit"]
    testData._columns = ["column1", "column2", "column3"]
    const sql = "INSERT INTO Foo(bar,baz) VALUES (${columns.column1},${columns.column2});"
    const interpolatedSql = doPlaceHolderValueInterpolations(testData, sql, mockPlaceHolders)
    expect(interpolatedSql).toEqual("INSERT INTO Foo(bar,baz) VALUES (apples,oranges);")
  })
  it('should interpolate column values into sql', (done) => {
    const sql = "INSERT INTO Foo(bar,baz) VALUES (${columns.column1},${columns.column2});"
    const interpolatedSql = "INSERT INTO Foo(bar,baz) VALUES (apples,oranges);"
    const uut = new PostgresSQLTask({ sql:sql })
    const testData = ["apples","oranges","bananas","cumcwats","dragon fruit"]
    testData._columns = ["column1", "column2", "column3"]
    
    uut.setConnection(mockConnection)
    uut
      .on('data', () => {
        expect(mockConnection.db.query).toHaveBeenCalledWith(interpolatedSql)
        done()
      })
      .write(testData)
  })
})
