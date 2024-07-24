# Transformers

Transformers manipulate row data and either replace the existing values or add new columns to each row depending on the type of transformer and the configuration.

Currently supported transformers are :

- ToUpperCaseTransformer
- FakerTransformer

## FakerTransformer

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| columns        | Array of column transformations                               |

### Usage

```js
FakerTransformer(
    { 
        columns: [
            {
                name: "column2",
                faker: "company.name"
            }
        ]
    }
)
```

faker is a string value that can be any of the currently supported [apis](https://fakerjs.dev/api/)

e.g. 

- finance.accountName
- person.firstName
- randomizer.next

### Example

src/examples/csv-faker.js

## ToUpperCaseTransformer

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| column         | source column to be transformed                               |

### Usage

```js
ToUpperCaseTransformer(
    { 
        column: "column2"
    }
)
```

### Example

src/examples/csv-to-upper-case.js