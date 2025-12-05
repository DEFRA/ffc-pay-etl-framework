## 🚀 Features

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

- 💾 CSV Source and Destination
- 👮 Validators
- 🤖 Transformers
- 🚨 Error Checking
- 🐘 Write directly to Postgres
- 👨‍⚕️ Intellisense

## 📦 Install

```bash
npm install --save-dev ffc-pay-etl-framework
```

## 🪄 Usage

```js
// ESM
import {
  Etl,
  Loaders,
  Validators,
  Transformers,
  Destinations,
} from "ffc-pay-etl-framework";

// CJS
const {
  Etl,
  Loaders,
  Validators,
  Transformers,
  Destinations,
} = require("ffc-pay-etl-framework");

let csvFile = `${process.cwd()}/test/fixtures/SoilType.csv`;
const spinner = new pkg.Spinner().start("Running ETL Pipeline");

const etl = new Etl.Etl();

etl
  .loader(Loaders.CSVLoader({ path: csvFile, columns: columns }))
  .transform(
    Transformers.FakerTransformer({
      columns: [
        {
          name: "Dist Name",
          faker: "location.city",
        },
      ],
    })
  )
  .destination(
    Destinations.CSVFileDestination({
      fileName: "SoilType_Output.csv",
      headers: true,
      includeErrors: false,
      quotationMarks: true,
    })
  )
  .pump()
  .on("error", () => {
    // Log simple error message
    console.error('ETL Error:', error.message)
  })
  .on("result", (data) => {
    console.log(data); // emits the last row with error information
    spinner.succeed("ETL Pipeline - succeeded");
  });
```

## 📢 Shout outs

[Faker JS](https://fakerjs.dev/guide/)

[Validator](https://github.com/validatorjs/validator.js)

[Kaggle](https://www.kaggle.com/datasets/anushkahedaoo/farming-factors)

## ✨ Contributing

Please make sure to read the [Contributing Guide](https://github.com/DEFRA/ffc-pay-etl-framework/blob/next/CONTRIBUTING.md) before making a pull request.
