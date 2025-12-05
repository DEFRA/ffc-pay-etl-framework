const { expect } = require('@jest/globals')
const Connections = require('../../src/database_connections')
const { Sequelize } = require('sequelize')

const mockAuthenticate = jest.fn().mockResolvedValue(true)

jest.mock('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => ({
    authenticate: mockAuthenticate,
    query: jest.fn().mockResolvedValue([[], 1]),
  }))
})
)

describe('postgresConnection tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(Sequelize).toBeCalledTimes(1)
    expect(Sequelize).toBeCalledWith(
      databaseName,
      userName,
      password,
      {
        dialect: 'postgres',
        host,
        logging: false,
        port
      }
    )
    expect(mockAuthenticate).toHaveBeenCalled()
  })

  test('should fail to connect', async () => {
    mockAuthenticate.mockImplementation(() => Promise.reject(new Error('error')))
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
      expect(Sequelize).toBeCalledTimes(1)
      expect(Sequelize).toBeCalledWith(
        databaseName,
        userName,
        password,
        {
          dialect: 'postgres',
          host,
          logging: false,
          port
        }
      )
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toMatch('error')
    }
  })
})
