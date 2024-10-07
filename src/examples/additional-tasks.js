const {
  Etl,
  Loaders,
  Destinations,
  Connections,
  Misc,
} = require("ffc-pay-etl-framework")

const csvFile = `${process.cwd()}/test/fixtures/Crops.csv`

const columns = [
  "DistCode",
  "Year",
  "StateCode",
  "StateName",
  "DistName",
  "RICEAREA",
  "RICEPRODUCTION",
  "RICEYIELD",
  "WHEATAREA",
  "WHEATPRODUCTION",
  "WHEATYIELD",
  "KHARIFSORGHUMAREA",
  "KHARIFSORGHUMPRODUCTION",
  "KHARIFSORGHUMYIELD",
  "RABISORGHUMAREA",
  "RABISORGHUMPRODUCTION",
  "RABISORGHUMYIELD",
  "SORGHUMAREA",
  "SORGHUMPRODUCTION",
  "SORGHUMYIELD",
  "PEARLMILLETAREA",
  "PEARLMILLETPRODUCTION",
  "PEARLMILLETYIELD",
  "MAIZEAREA",
  "MAIZEPRODUCTION",
  "MAIZEYIELD",
  "FINGERMILLETAREA",
  "FINGERMILLETPRODUCTION",
  "FINGERMILLETYIELD",
  "BARLEYAREA",
  "BARLEYPRODUCTION",
  "BARLEYYIELD",
  "CHICKPEAAREA",
  "CHICKPEAPRODUCTION",
  "CHICKPEAYIELD",
  "PIGEONPEAAREA",
  "PIGEONPEAPRODUCTION",
  "PIGEONPEAYIELD",
  "MINORPULSESAREA",
  "MINORPULSESPRODUCTION",
  "MINORPULSESYIELD",
  "GROUNDNUTAREA",
  "GROUNDNUTPRODUCTION",
  "GROUNDNUTYIELD",
  "SESAMUMAREA",
  "SESAMUMPRODUCTION",
  "SESAMUMYIELD",
  "RAPESEEDANDMUSTARDAREA",
  "RAPESEEDANDMUSTARDPRODUCTION",
  "RAPESEEDANDMUSTARDYIELD",
  "SAFFLOWERAREA",
  "SAFFLOWERPRODUCTION",
  "SAFFLOWERYIELD",
  "CASTORAREA",
  "CASTORPRODUCTION",
  "CASTORYIELD",
  "LINSEEDAREA",
  "LINSEEDPRODUCTION",
  "LINSEEDYIELD",
  "SUNFLOWERAREA",
  "SUNFLOWERPRODUCTION",
  "SUNFLOWERYIELD",
  "SOYABEANAREA",
  "SOYABEANPRODUCTION",
  "SOYABEANYIELD",
  "OILSEEDSAREA",
  "OILSEEDSPRODUCTION",
  "OILSEEDSYIELD",
  "SUGARCANEAREA",
  "SUGARCANEPRODUCTION",
  "SUGARCANEYIELD",
  "COTTONAREA",
  "COTTONPRODUCTION",
  "COTTONYIELD",
  "FRUITSAREA",
  "VEGETABLESAREA",
  "FRUITSANDVEGETABLESAREA",
  "POTATOESAREA",
  "ONIONAREA",
  "FODDERAREA",
]

const etl = new Etl.Etl()

etl
  .connection(
    new Connections.PostgresDatabaseConnection({
      name: "MyNewConnection",
      username: "postgres",
      password: "ppp",
      host: "localhost",
    })
  )
  .loader(Loaders.CSVLoader({ path: csvFile, columns: columns }))
  .destination(
    Destinations.PostgresDestination(
      {
        table: "target_table",
        connection: "MyConnection",
        mapping: [
          {
            column: "Dist Code",
            targetColumn: "dist_code",
            targetType: "string",
          },
        ],
        includeErrors: false,
      },
      new Misc.PostgresSQLTask({
        connectionname: "MyConnection",
        sql: "INSERT INTO TARGET_TABLE (ColumnA, ColumnB, ColumnC) VALUES ('${columns.DistCode}', '${columns.Year}', '${columns.StateCode}');",
      })
    )
  )
  .pump();

