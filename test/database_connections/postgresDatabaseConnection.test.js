const { expect } = require('@jest/globals')
const Connections = require('../../src/database_connections')
const { Sequelize } = require('sequelize')

const mockAuthenticate = jest.fn().mockResolvedValue(true)

jest.mock('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(()=>({
    authenticate: mockAuthenticate,
    query: jest.fn().mockResolvedValue([[], 1]),
  }))
  })
)

describe('postgresConnection tests', () => {
  beforeEach(() => {
      jest.clearAllMocks()
  })
  it('should connect', async () => {
    const connectionName = 'MyConnection'
    const databaseName = 'MyTestDB'
    const userName = 'testUser'
    const password = 'testPassword'
    const host = 'localhost'
    const port = 1234

    const uut  = await Connections.PostgresDatabaseConnection({
      connectionname: connectionName,
      database: databaseName,
      username: userName,
      password: password,
      host: host,
      port: port
    })

    expect(uut.name).toEqual(connectionName)
    expect(uut.db).toBeTruthy()
    expect(Sequelize).toBeCalledTimes(1)
    expect(Sequelize).toBeCalledWith(
        databaseName, 
        userName, 
        password, 
        {
            "dialect": "postgres", 
            "host": host, 
            "logging": false, 
            "port": port
        }
    )
    expect(mockAuthenticate).toHaveBeenCalled()
  })
})