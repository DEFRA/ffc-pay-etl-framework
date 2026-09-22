const { Transform } = require('node:stream')

/**
 * Creates a Node.js Transform stream that replaces placeholder data with fake data.
 *
 * @param {Object} options
 * @param {Array} options.columns List of column names and their mapped Faker methods.
 * @param {String} options.locale Optional locale string identifier (e.g., 'en', 'de', 'en_IN').
 * @returns {Transform}
 */
function fakerTransformer (options) {
  const columns = options.columns
  let faker
  let getFaker
  let fakerLoadError
  let fakerLoaded = false

  async function loadFaker () {
    const { Faker, allLocales, faker: defaultFaker } = await import('@faker-js/faker')

    // Resolve the locale instance safely using the Faker v10 allLocales registry
    if (options.locale) {
      const localeKey = options.locale === 'en_IND' ? 'en_IN' : options.locale
      const selectedLocale = allLocales[localeKey]

      if (!selectedLocale) {
        throw new Error(`Locale "${options.locale}" is not supported by Faker v10.`)
      }

      // Build a fallback chain so undefined locale data (e.g. company.name_pattern in en_GB)
      // falls back through en and finally base, matching Faker v10's locale resolution.
      // Faker v10's allLocales registry always includes 'en' and 'base'.
      const localeChain = [selectedLocale]
      if (localeKey !== 'en') {
        localeChain.push(allLocales.en)
      }
      if (localeKey !== 'base') {
        localeChain.push(allLocales.base)
      }

      faker = new Faker({ locale: localeChain })
    } else {
      faker = defaultFaker
    }

    // Modern path resolver using optional chaining to dig down into Faker's Proxy structure
    getFaker = function (fakerType) {
      return fakerType.split('.').reduce((current, key) => current?.[key], faker)
    }

    fakerLoaded = true
  }

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (chunk, _, callback) {
      if (fakerLoadError) {
        callback(fakerLoadError)
        return
      }

      const runTransform = async () => {
        if (!fakerLoaded) {
          await loadFaker()
        }

        const { _columns } = chunk

        for (const column of columns) {
          const colIndex = _columns.indexOf(column.name)

          // Guard: Skip processing if the configured column name doesn't exist in the chunk headers
          if (colIndex === -1) {
            continue
          }

          const fakerMethod = getFaker(column.faker)

          // Guard: Verify that the method exists and can be executed safely
          if (typeof fakerMethod !== 'function') {
            throw new TypeError(`Faker method "${column.faker}" is invalid or does not exist.`)
          }

          chunk[colIndex] = fakerMethod()
        }

        return chunk
      }

      runTransform()
        .then((transformed) => callback(null, transformed))
        .catch((err) => {
          fakerLoadError = err
          callback(err)
        })
    }
  })
}

module.exports = {
  FakerTransformer: fakerTransformer
}
