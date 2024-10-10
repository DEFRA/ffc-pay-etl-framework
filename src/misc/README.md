# Miscellanous pipeline items

## PostgresSQLTask

Executes an arbitrary sql task either as part of another transformation or as an event

### Example

```js
const {
  Connections,
  Destinations,
  Etl,
  Loaders,
  Misc,
  Validators,
  Transformers,
} = require("ffc-pay-etl-framework");

const etl = new Etl.Etl();

etl
  .connections(
    new Connections.PostgresSQLConnection({
      connectionname: "MyConnection",
      database: "MyDB",
      username: "MyUserName",
      password: "MyPassword",
      host: "localhost",
      port: 5432,
    })
  )
  .beforeETL(
    new Misc.PostgresSQLTask({
      connection: "MyConnection",
      sql: "INSERT INTO MyTable (column1, column2) VALUES ('apples','oranges');",
    })
  )
  .loader(new Loaders.CSVLoader({ path: csvFile, columns: columns }))
  .destination(
    new Destinations.PostgresDestination({
      connection: "MyConnection",
      table: "target",
      mapping: [
        {
          column: "Dist Code",
          targetColumn: "dist_code",
          targetType: "string",
        },
      ],
      includeErrors: false,
    })
  )
  .pump();
```
