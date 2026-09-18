const { expect } = require('@jest/globals')
const { FakerTransformer } = require('../../../app/transformers')
const { Readable, PassThrough } = require('node:stream')

describe('fakerTransformer tests', () => {
  test('should convert a value to a fake', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ]
    })
    const testData = ['a', 'b', 'c']
    testData.errors = []
    testData.rowId = 1
    testData._columns = ['column1', 'column2', 'column3']
    const readable = Readable.from([testData])

    readable
      .pipe(uut)
      .pipe(new PassThrough({
        objectMode: true,
        transform (chunk, _, callback) {
          expect(chunk.errors.length).toEqual(0)
          expect(chunk[1]).not.toEqual('b')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should support locales', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'location.zipCode'
        }
      ],
      locale: 'en_GB' // Note: Faker v10 uses snake_case keys ('en_GB') in the allLocales registry
    })
    const testData = ['a', 'b', 'c']
    testData.errors = []
    testData.rowId = 1
    testData._columns = ['column1', 'column2', 'column3']
    const readable = Readable.from([testData])

    readable
      .pipe(uut)
      .pipe(new PassThrough({
        objectMode: true,
        transform (chunk, _, callback) {
          expect(chunk.errors.length).toEqual(0)
          expect(chunk[1]).not.toEqual('b')

          // Regex checks for common UK Outward/Inward post code formats (e.g., "M1 1AA", "EC1A 1BB")
          const regex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i
          expect(regex.test(chunk[1])).toBe(true)

          done()
          callback(null, chunk)
        }
      }))
  })
})
