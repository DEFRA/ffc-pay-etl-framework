const { CSVLoader } = require('./loaders')
const { Etl } = require('./lib')
const { RequiredValidator, UniqueValidator } = require('./validators')
const { ConsoleDestination } = require('./destinations')

const csvFile = `${process.cwd()}/test/fixtures/20240708_SFI23_Extracts_Dax.csv`

const columns = [
  'CALCULATIONID',
  'PAYMENTPERIOD',
  'PAYMENTREFERENCE',
  'TOTALQUARTERLYPAYMENT',
  'TRANSDATE'
]

const etl = new Etl()
function run () {
  etl
    .loader(CSVLoader(csvFile, columns))
    .validator(UniqueValidator({ column: 'PAYMENTREFERENCE' }))
    .validator(RequiredValidator({ columns: [0, 1, 2, 3], message: 'Required column cannot be NULL' }))
    .destination(ConsoleDestination())
    .pump()
}

run()
