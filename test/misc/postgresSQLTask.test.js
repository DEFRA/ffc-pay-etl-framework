const { PostgresSQLTask } = require('../../src/misc/postgresSQLTask.js')
const { expect } = require("@jest/globals")

describe('PostgresSQLTask tests', () => {
  it('should execute plain sql', (done) => {
    const uut = new PostgresSQLTask({ sql: "INSERT INTO Foo(bar,baz) VALUES (1,2);"})
    uut
      .on('data', () => done())
      .write([1,2,3,4,5])
  })
})
