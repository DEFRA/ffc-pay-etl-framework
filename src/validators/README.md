# Validators

Validators are expected to check specific columns within each row against specific validation rules

Currently supported destinations are :

- RequiredValidator
- UniqueValidator
- MultiToolValidator

## RequiredValidator

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| columns        | Array of column indexes                                       |

### Usage

```js
Validators.RequiredValidator({
    columns: [0] 
})
```

### Example

src/examples/csv-required-validator.js

## UniqueValidator

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| column         | Column to be tested for uniqueness                            |

### Usage

```js
Validators.UniqueValidator(
    { column: "field_one" }
)
```

### Example

src/examples/csv-unique-validator.js

## MultiToolValidator

### Options

| option         | description                                                   |
| -------------- | ------------------------------------------------------------- |
| column         | Column to be tested for validity and validator specification  |

NB Any validators specified [here](https://github.com/validatorjs/validator.js) can be used

### Usage

```js
Validators.MultiToolValidator( { columns: [
    {
        name: "SOIL TYPE PERCENT (Percent)",
        validator: "isAlphanumeric",
        args: {
                locale: "en-GB",
                options: {
                    ignore: "-;%/ "
                }
        }
    }
]
})
```

### Example

src/examples/csv-multi-tool-validator.js
