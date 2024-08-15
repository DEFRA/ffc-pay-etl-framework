"use strict"

const Sequelize = jest.fn()
const authenticate = jest.fn().mockImplementation(()=>Promise.resolve(true))
const query = jest.fn().mockImplementation((sql)=>Promise.resolve([[],1]))
Sequelize.mockImplementation((database, username, password, options) => ({
  authenticate: authenticate,
  query: query
}))

module.exports = Sequelize
module.exports.Sequelize = Sequelize
module.exports.default = Sequelize