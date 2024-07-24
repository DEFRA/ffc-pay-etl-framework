// @ts-nocheck
const { RowMetaData } = require("./rowMetaData")
const { compose } = require("node:stream")

/**
 * @typedef {Object} Etl
 * @function loader 
 * @function pump
 * @function validator
 * @function destination
 * @function transform
 */

/**
 * 
 * @returns Etl
 */
function Etl(){
    let self = this
    self.validatorList = []
    self.transformationList = []
    self.destinationList = []

    this.loader = (loader) => {
        self.loader = loader
        return self
    }
        
    this.pump = () => {
        this.loader
            .pump(this.loader)
            .pipe(
                compose(
                    RowMetaData,
                    ...self.validatorList,
                    ...self.transformationList,
                    ...self.destinationList
                )
            )
    }

    this.validator = (validator) => {
        self.validatorList.push(validator)
        return self
    }

    this.destination = (destination) => {
        self.destinationList.push(destination)
        return self
    }

    this.transform = (transform) => {
        self.transformationList.push(transform)
        return self
    }

    return;
}

module.exports = {
    Etl
}