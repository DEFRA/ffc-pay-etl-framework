const { Writable } = require("node:stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.includeErrors
 * @returns Writable
 */
function ConsoleDestination(options){
    const includeErrors = options.includeErrors
    const writable = new Writable({
        objectMode: true,
        write(chunk, _, callback){
            if(chunk.errors.length === 0 || includeErrors)
                console.log(chunk)
            // @ts-ignore
            this.tasks?.forEach(task => task.write(chunk))
            callback()
        }
    })

    Object.assign(writable, {
        setConnection: function (connection){
            this.connection = connection
        }.bind(writable),
        getConnectionName: function (){
            return this.connection?.name
        }.bind(writable),
        setTasks: function(tasks){
            this.tasks = tasks
        }.bind(writable)
    })

    return writable
}

module.exports = {
    ConsoleDestination
}