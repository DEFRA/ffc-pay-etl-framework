// @ts-nocheck
const EventEmitter = require('node:events')
const util = require('node:util')
const { RowMetaData } = require("./rowMetaData")
const { compose } = require("node:stream")

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
function Etl(){
    EventEmitter.call(this)
    let self = this
    self.beforeETLList = []
    self.connectionList = []
    self.validatorList = []
    self.transformationList = []
    self.destinationList = []

    this.loader = (loader) => {
        self.loader = loader
        return self
    }
        
    this.pump = () => {
        this.beforeETLList.forEach(task => {
            task.write({})
        })
        this.loader
            .pump(this.loader)
            .pipe(
                compose(
                    RowMetaData(),
                    ...self.validatorList,
                    ...self.transformationList,
                    ...self.destinationList.map(dl => dl.on('result', (data) => self.emit('result', data)))
                )
                // @ts-ignore
            ).on('finish', (data) => self.emit('finish', data))
            return self
    }

    this.beforeETL = (pipelineTask) => {
        const connectionname = pipelineTask.getConnectionName()
        const connection = this.connectionList.filter(c => c.name === connectionname)[0]
        if (!connection) {
            throw new Error(`Connection with name ${connectionname} not found`)
        }
        pipelineTask.setConnection(connection)
        self.beforeETLList.push(pipelineTask)
        return self
    }

    this.connection = (connection) => {
        self.connectionList.push(connection)
        return self
    }

    this.validator = (validator) => {
        self.validatorList.push(validator)
        return self
    }

    this.destination = (destination, ...tasks) => {
        const connectionname = destination.getConnectionName()
        
        const connection = this.connectionList.filter(c => c.name === connectionname)[0]
        if (connection) {
            destination.setConnection(connection)
        }
        
        tasks && destination.setTasks(tasks)
        self.destinationList.push(destination)
        return self
    }

    this.transform = (transform) => {
        self.transformationList.push(transform)
        return self
    }

    return
}

util.inherits(Etl, EventEmitter)

module.exports = {
    Etl
}