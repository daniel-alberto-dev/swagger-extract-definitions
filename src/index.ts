#!/usr/bin/env node
'use strict';
import { readFileSync } from 'fs';
import openapiSchemaToJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';

import { save } from './save';
import { compile } from './compile';
import { prettify } from './prettify';
import { replaceRefs } from './utils';
import {
  bannerComment,
  compilerOptions,
  isIgnoreHead,
  output,
  targetFile,
} from './constants';

export * from './types';
export * from './compile';
export * from './save';
export * from './prettify';

(async () => {
  const openApiSpec = JSON.parse(readFileSync(targetFile, 'utf-8'));

  const jsonSchema = openapiSchemaToJsonSchema(openApiSpec);
  const modifiedJsonSchema = replaceRefs(jsonSchema);

  const routes = modifiedJsonSchema['paths'];
  const definitions = modifiedJsonSchema['components']['schemas'];

  const [{ text }, prettier] = await Promise.all([
    compile(routes, definitions, isIgnoreHead, compilerOptions),
    prettify(compilerOptions),
  ]);

  const formatted = await prettier(bannerComment + text);
  await save(formatted, output);
})();
