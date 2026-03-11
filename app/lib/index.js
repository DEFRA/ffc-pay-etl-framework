const EventEmitter = require('node:events')
const { RowMetaData } = require('./row-meta-data')
const { compose } = require('node:stream')

/**
 * @typedef {Object} Etl
 * @function loader
 * @function pump
 * @function connection
 * @function validator
 * @function destination
 * @function transform
 */

/**
 *
 * @returns Etl
 */
class Etl extends EventEmitter {
  constructor () {
    super()
    this.store = []
    this.beforeETLList = []
    this.connectionList = []
    this.validatorList = []
    this.transformationList = []
    this.destinationList = []
  }

  loader (loader) {
    this.loader = loader
    return this
  }

  pump () {
    this.beforeETLList.forEach(task => {
      task.write({})
    })

    this.loader
      .pump(this.loader)
      .pipe(
        compose(
          RowMetaData(),
          ...this.validatorList,
          ...this.transformationList,
          ...this.destinationList.map(dl => dl.on('result', data => this.emit('result', data)))
        )
      )
      .on('error', err => this.emit('error', err))
    return this
  }

  beforeETL (pipelineTask) {
    const connectionname = pipelineTask.getConnectionName()
    const connection = this.connectionList.find(c => c.name === connectionname)
    if (!connection) {
      throw new Error(`Connection with name ${connectionname} not found`)
    }
    pipelineTask.setConnection(connection)
    pipelineTask.setETL(this)
    this.beforeETLList.push(pipelineTask)
    return this
  }

  connection (connection) {
    this.connectionList.push(connection)
    return this
  }

  validator (validator) {
    this.validatorList.push(validator)
    return this
  }

  destination (destination, ...tasks) {
    const connectionname = destination.getConnectionName()
    const connection = this.connectionList.find(c => c.name === connectionname)
    if (!connection && destination.type === 'PostgresDestination') {
      throw new Error(`No connection could be found with name ${connectionname}`)
    } else {
      destination.setConnection(connection)
    }

    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        task.setETL(this)
      }
      destination.setTasks(tasks)
    }
    this.destinationList.push(destination)
    return this
  }

  transform (transform) {
    this.transformationList.push(transform)
    return this
  }
}

module.exports = {
  Etl
}
