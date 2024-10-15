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
  .on("finish", () => {
    //Update spinner
    spinner.succeed("ETL Pipeline - succeeded");
  })
  .on("result", (data) => {
    console.log(data); // emits the last row with error information
  });
```

## 📢 Shout outs

[Faker JS](https://fakerjs.dev/guide/)

[Validator](https://github.com/validatorjs/validator.js)

[Kaggle](https://www.kaggle.com/datasets/anushkahedaoo/farming-factors)

## ✨ Contributing

Please make sure to read the [Contributing Guide](https://github.com/DEFRA/ffc-pay-etl-framework/blob/next/CONTRIBUTING.md) before making a pull request.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/suityou01"><img src="https://avatars.githubusercontent.com/u/7422644?v=4?s=100" width="100px;" alt="Charlie Benger-Stevenson"/><br /><sub><b>Charlie Benger-Stevenson</b></sub></a><br /><a href="https://github.com/DEFRA/ffc-pay-etl-framework/commits?author=suityou01" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GodsonLeigh"><img src="https://avatars.githubusercontent.com/u/139965284?v=4?s=100" width="100px;" alt="Leigh Godson"/><br /><sub><b>Leigh Godson</b></sub></a><br /><a href="https://github.com/DEFRA/ffc-pay-etl-framework/commits?author=GodsonLeigh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/samplackett"><img src="https://avatars.githubusercontent.com/u/60177449?v=4?s=100" width="100px;" alt="Sam Plackett"/><br /><sub><b>Sam Plackett</b></sub></a><br /><a href="https://github.com/DEFRA/ffc-pay-etl-framework/commits?author=samplackett" title="Code">💻</a></td>    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
