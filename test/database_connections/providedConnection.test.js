const { ProvidedConnection } = require('../../src/database_connections')

describe('ProvidedConnection', () => {
  test('should return a connection object with the correct name and db', async () => {
    const mockSequelize = {
      dialect: 'mysql',
      define: jest.fn(),
      authenticate: jest.fn()
    }
    const options = {
      connectionname: 'TestConnection',
      sequelize: mockSequelize
    }

    const result = await ProvidedConnection(options)

    expect(result).toEqual({
      name: 'TestConnection',
      db: mockSequelize
    })
  })

  test('should handle empty options', async () => {
    const options = {
      connectionname: '',
      sequelize: null
    }

    const result = await ProvidedConnection(options)

    expect(result).toEqual({
      name: '',
      db: null
    })
  })
})
