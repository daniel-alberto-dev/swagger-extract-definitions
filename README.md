# swagger-extract-definitions

[![NPM version](https://img.shields.io/npm/v/swagger-extract-definitions.svg?style=flat)](https://www.npmjs.com/package/swagger-extract-definitions)
![Tests](https://github.com/daniel-alberto-dev/swagger-extract-definitions/workflows/Tests/badge.svg)

Extracts TypeScript definitions from [Swagger](https://swagger.io/) json files. Based on [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript/v/10.1.5) and [fastify-extract-definitions](https://github.com/neruchev/fastify-extract-definitions) packages.

## Pre requirements

- `node.js`: `>=22.*`

## Installation

Install it with yarn:

```sh
  yarn add swagger-extract-definitions
```

Or with npm:

```sh
  npm install swagger-extract-definitions
```

## Usage

Add it to your project with register, pass it some options, and you are done!

⚠️ Note! Use this package for development only.

```
  "scripts": {
  "generate:types": "swagger-extract-definitions --targetDir=./schemas --outDir=./src"
}
```

See [example](./example) for more details.

## Options

| key        | type      | default                       | description                         |
| ---------- | --------- | ----------------------------- | ----------------------------------- |
| outDir     | `string`  | `./src/shared/api`            | Output directory                    |
| targetDir  | `string`  | `./scripts/generated/schemas` | Target directory with `.json` files |
| ignoreHead | `boolean` | `_generated.ts`               | Filename                            |

## License

MIT
