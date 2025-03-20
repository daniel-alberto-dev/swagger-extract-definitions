#!/usr/bin/env node
'use strict';
import fs from 'fs';
import openapiSchemaToJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';

import { save } from './save';
import { compile } from './compile';
import { prettify } from './prettify';
import { generateRootFromFile, replaceRefs, validateJsonFile } from './utils';
import {
  bannerComment,
  compilerOptions,
  isIgnoreHead,
  output,
  targetDir,
} from './constants';
import path from 'path';

export * from './types';

(async () => {
  const filesContent = fs.readdirSync(targetDir).map((filename) => {
    const filePath = path.join(targetDir, filename);
    const fileContent = validateJsonFile(filePath);

    const jsonSchema = openapiSchemaToJsonSchema(fileContent);
    const modifiedJsonSchema = replaceRefs(jsonSchema);

    const routes = modifiedJsonSchema['paths'];
    const definitions = modifiedJsonSchema['components']['schemas'];

    return {
      routes,
      definitions,
      rootName: generateRootFromFile(filename),
    };
  });

  const compiledContentCb = filesContent.map(
    async ({ routes, definitions, rootName }) => {
      const { text } = await compile(
        routes,
        definitions,
        rootName,
        isIgnoreHead,
        compilerOptions
      );

      return text;
    }
  );

  const generated = await Promise.all(compiledContentCb);
  const prettier = await prettify();

  const formatted = await prettier(bannerComment + generated.join(' '));
  await save(formatted, output);
})();
