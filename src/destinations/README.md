# Destinations

Destinations are expected to write out to an output. This could be a file, a database, an endpoint, whatever.

Currently supported destinations are :

- CSVFileDestination
- PostgresDestination
- SQLFileDestination

## CSVFileDestination

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| fileName       | absolute path to the csv file to be written                   |
| headers        | treat the first line of the file as column header information |
| includeErrors  | write out any rows that contain errors                        |
| quotationMarks | wrap values in quotation marks                                |

### Usage

```js
CSVFileDestination({
  fileName: "...",
  headers: true,
  includeErrors: false,
  quotationMarks: true,
});
```

### Example

src/examples/csv-to-csv.js

## PostgresDestination

### Options

| option        | description                                            |
| ------------- | ------------------------------------------------------ |
| table         | the name of the table to be inserted into              |
| username      | the username for the database connection               |
| password      | the password for the database connection               |
| database      | the name of the database for the connection            |
| host          | the host name for the database connection              |
| port          | the port for the database connection. Defaults to 5432 |
| includeErrors | write out any rows that contain errors                 |
| mapping       | field mappings from source to target                   |

### Usage

```js
PostgresDestination({
  username: "postgres",
  password: "ppp",
  database: "etl_db",
  host: "postgres",
  table: "target",
  includeErrors: false,
  mapping: [
    {
      column: "column1",
      targetColumn: "target_column1",
      targetType: "varchar",
    },
  ],
});
```

### Example

src/examples/csv-to-postgres.js

## SQLFileDestination

### options

| option   | description                                 |
| -------- | ------------------------------------------- |
| fileName | absolute path to the sql file to be written |
| mode     | insert or update mode                       |
| table    | the table for the statements                |
| mapping  | field mappings from source to target        |

### Usage

```js
SQLFileDestination({
  filename: "...",
  mode: SQL_MODE.INSERT_MODE,
  table: "target",
  includeErrors: false,
  mapping: [
    {
      column: "column1",
      targetColumn: "target_column1",
      targetType: "varchar",
    },
  ],
});
```

### Example

src/examples/csv-to-sqlfile.js
