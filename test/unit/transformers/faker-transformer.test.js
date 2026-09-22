const { expect } = require('@jest/globals')
const { FakerTransformer } = require('../../../app/transformers')
const { Readable, PassThrough } = require('node:stream')

describe('fakerTransformer tests', () => {
  test('should skip columns that do not exist in the chunk headers', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'missingColumn',
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
          expect(chunk[0]).toEqual('a')
          expect(chunk[1]).toEqual('b')
          expect(chunk[2]).toEqual('c')
          done()
          callback(null, chunk)
        }
      }))
  })

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
          expect(typeof chunk[1]).toBe('string')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should support locales that need a fallback to base data', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ],
      locale: 'en_GB'
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
          expect(typeof chunk[1]).toBe('string')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should map en_IND locale to en_IN', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'location.zipCode'
        }
      ],
      locale: 'en_IND'
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

  test('should error for unsupported locale', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'location.zipCode'
        }
      ],
      locale: 'xx_XX'
    })
    const testData = ['a', 'b', 'c']
    testData.errors = []
    testData.rowId = 1
    testData._columns = ['column1', 'column2', 'column3']
    const readable = Readable.from([testData])

    readable
      .pipe(uut)
      .on('error', (err) => {
        expect(err.message).toContain('Locale "xx_XX" is not supported by Faker v10.')
        done()
      })
      .pipe(new PassThrough({ objectMode: true }))
  })

  test('should error for invalid faker method', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'does.not.exist'
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
      .on('error', (err) => {
        expect(err.message).toContain('Faker method "does.not.exist" is invalid or does not exist.')
        done()
      })
      .pipe(new PassThrough({ objectMode: true }))
  })

  test('should cache load failure and reject subsequent chunks', async () => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'does.not.exist'
        }
      ]
    })

    await expect(new Promise((resolve, reject) => {
      const testData = ['a', 'b', 'c']
      testData.errors = []
      testData.rowId = 1
      testData._columns = ['column1', 'column2', 'column3']

      Readable.from([testData])
        .pipe(uut)
        .on('error', reject)
        .on('data', resolve)
    })).rejects.toThrow('Faker method "does.not.exist" is invalid or does not exist.')
  })

  test('should use cached error for chunks after the first failure', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'does.not.exist'
        }
      ]
    })

    const firstChunk = ['a', 'b', 'c']
    firstChunk.errors = []
    firstChunk.rowId = 1
    firstChunk._columns = ['column1', 'column2', 'column3']

    const secondChunk = ['d', 'e', 'f']
    secondChunk.errors = []
    secondChunk.rowId = 2
    secondChunk._columns = ['column1', 'column2', 'column3']

    uut._transform(firstChunk, 'utf8', (err) => {
      expect(err.message).toContain('Faker method "does.not.exist" is invalid or does not exist.')

      uut._transform(secondChunk, 'utf8', (secondErr) => {
        expect(secondErr.message).toContain('Faker method "does.not.exist" is invalid or does not exist.')
        done()
      })
    })
  })

  test('should support the en locale without duplicate fallback entries', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ],
      locale: 'en'
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
          expect(typeof chunk[1]).toBe('string')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should support the base locale without duplicate fallback entries', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ],
      locale: 'base'
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
          expect(typeof chunk[1]).toBe('string')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should normalize hyphenated locale keys', (done) => {
    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ],
      locale: 'en-GB'
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
          expect(typeof chunk[1]).toBe('string')
          done()
          callback(null, chunk)
        }
      }))
  })

  test('should log the resolved locale chain when DEBUG_FAKER_TRANSFORMER is true', (done) => {
    const originalDebug = process.env.DEBUG_FAKER_TRANSFORMER
    process.env.DEBUG_FAKER_TRANSFORMER = 'true'
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    const uut = FakerTransformer({
      columns: [
        {
          name: 'column2',
          faker: 'company.name'
        }
      ],
      locale: 'en_GB'
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
          process.env.DEBUG_FAKER_TRANSFORMER = originalDebug
          expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ffc-pay-etl-framework] FakerTransformer resolved locale "en_GB" to chain: en_GB'))
          consoleSpy.mockRestore()
          callback(null, chunk)
          done()
        }
      }))
  })
})
