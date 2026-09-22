const { ProvidedConnection } = require('../../../app/database-connections')

describe('ProvidedConnection', () => {
  test('should return a connection object with the correct name and db', async () => {
    const mockRaw = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 })
    const mockClient = jest.fn()
    mockClient.raw = mockRaw
    const mockConnection = {
      client: mockClient,
      transaction: jest.fn(),
      close: jest.fn()
    }
    const options = {
      connectionname: 'TestConnection',
      connection: mockConnection
    }

    const result = await ProvidedConnection(options)

    expect(result.name).toEqual('TestConnection')
    expect(result.db.client).toBe(mockClient)
    expect(result.db.transaction).toBe(mockConnection.transaction)
    expect(result.db.close).toBe(mockConnection.close)

    await result.db.query('select 1')
    expect(mockRaw).toHaveBeenCalledWith('select 1')
  })

  test('should handle empty options', async () => {
    const options = {
      connectionname: '',
      connection: null
    }

    const result = await ProvidedConnection(options)

    expect(result).toEqual({
      name: '',
      db: null
    })
  })
})
