const { expect } = require('@jest/globals')
const Connections = require('../../../app/database-connections')
const { Database } = require('ffc-database')

const mockRaw = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 })
const mockClient = jest.fn().mockImplementation(() => ({ raw: mockRaw }))
mockClient.raw = mockRaw
const mockConnect = jest.fn().mockReturnValue({ client: mockClient })

jest.mock('ffc-database', () => ({
  Database: jest.fn().mockImplementation(() => ({
    connect: mockConnect
  }))
}))

describe('postgresConnection tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRaw.mockResolvedValue({ rows: [], rowCount: 0 })
    mockConnect.mockReturnValue({ client: mockClient })
  })

  test('should connect', async () => {
    const connectionName = 'MyConnection'
    const databaseName = 'MyTestDB'
    const userName = 'testUser'
    const password = 'testPassword'
    const host = 'localhost'
    const port = 1234

    const uut = await Connections.PostgresDatabaseConnection({
      connectionname: connectionName,
      database: databaseName,
      username: userName,
      password,
      host,
      port
    })

    expect(uut.name).toEqual(connectionName)
    expect(uut.db).toBeTruthy()
    expect(Database).toBeCalledTimes(1)
    expect(Database).toBeCalledWith(
      expect.objectContaining({
        database: databaseName,
        username: userName,
        password,
        host,
        port
      })
    )
    expect(mockConnect).toHaveBeenCalled()
    expect(mockRaw).toHaveBeenCalledWith('select 1')
  })

  test('should expose a query method backed by the knex client', async () => {
    const uut = await Connections.PostgresDatabaseConnection({
      connectionname: 'MyConnection',
      database: 'MyTestDB',
      username: 'testUser',
      password: 'testPassword',
      host: 'localhost',
      port: 1234
    })

    mockRaw.mockClear()
    mockRaw.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 })

    const result = await uut.db.query('select * from foo')

    expect(mockRaw).toHaveBeenCalledWith('select * from foo')
    expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1 })
  })

  test('should fail to connect', async () => {
    mockRaw.mockImplementation(() => Promise.reject(new Error('error')))
    const connectionName = 'MyConnection'
    const databaseName = 'MyTestDB'
    const userName = 'testUser'
    const password = 'testPassword'
    const host = 'localhost'
    const port = 1234

    try {
      await Connections.PostgresDatabaseConnection({
        connectionname: connectionName,
        database: databaseName,
        username: userName,
        password,
        host,
        port
      })
    } catch (e) {
      expect(Database).toBeCalledTimes(1)
      expect(mockRaw).toHaveBeenCalledWith('select 1')
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toMatch('error')
    }
  })
})
