import { JSONSchema4 } from 'json-schema';
import { resolve } from 'path';
import { accessSync, readFileSync, lstatSync, constants } from 'fs';

import { CompilerOptions } from './types';

const generated: Record<string, number> = {};

const calcCwd = (cwd: string) =>
  process.platform === 'win32' ? cwd.replace(/\\/g, '/') : cwd;

export const capitalize = (str: string) =>
  (str[0] ?? '').toUpperCase() + str.substring(1).toLowerCase();

export const normalizeTitle = (title: string) =>
  title
    .replace(/[^0-9a-z ]/gi, ' ')
    .split(' ')
    .filter((item) => item !== '')
    .map((item) => item[0].toUpperCase() + item.slice(1))
    .join('');

export const generateEndpointName = (endpoint: string) => {
  if (!endpoint) {
    return 'Empty';
  }

  const parts = endpoint
    .replace('/*', '/all')
    .replace(/[^0-9a-z/?&=:-]/gi, '')
    .split(/[/?&=:-]+/)
    .filter((item) => item !== '')
    .map((item) => item[0].toUpperCase() + item.slice(1));

  if (!parts.length) {
    return 'Root';
  }

  const name = parts.join('');
  const counter = generated[name] || 0;

  generated[name] = counter + 1;
  return counter ? name + counter : name;
};

export const createSchemaObject = (
  title: string | undefined,
  properties?: Record<string, JSONSchema4>
): JSONSchema4 => ({
  title,
  type: 'object',
  required: properties ? Object.keys(properties) : undefined,
  properties,
  additionalProperties: false,
});

export const patchCompilerOptions = (
  options: CompilerOptions,
  definitions: JSONSchema4
): CompilerOptions => {
  const cwd = calcCwd(options.cwd || process.cwd());

  return {
    ...options,
    bannerComment: '',
    format: false,
    $refOptions: {
      ...options.$refOptions,
      resolve: {
        file: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          read: (file: any) => {
            const key = file.url.substring(cwd.length);
            const text = definitions[key] || definitions[key.slice(1)];

            if (!text) {
              const error = new Error(
                `swagger-extract-definitions: cannot resolve schema for ${file.url}`
              );

              throw error;
            }

            return text;
          },
        },
        ...options.$refOptions?.resolve,
      },
    },
  };
};

export const replaceRefs = (schema: JSONSchema4) => {
  if (typeof schema === 'object' && schema !== null) {
    if (schema.$ref && typeof schema.$ref === 'string') {
      if (schema.$ref.startsWith('#/components/schemas/')) {
        schema.$ref = schema.$ref
          .replace('#/components/schemas/', '')
          .replace('/properties/', '#/properties/');
      }
    }

    Object.keys(schema).forEach((key) => {
      schema[key] = replaceRefs(schema[key]);
    });
  }

  return schema;
};

export const validateSwaggerJson = (filePath: string) => {
  const fullPath = resolve(process.cwd(), filePath);

  try {
    accessSync(fullPath, constants.R_OK);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(
      `Can't resolve the Swagger file: '${fullPath}'.\nFile does not exist or you do not have access rights.`
    );
  }

  let fileContent: string;
  try {
    fileContent = readFileSync(fullPath, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(
      `Can't read the Swagger file: '${fullPath}'.\nMake sure the file is accessible.`
    );
  }

  let swaggerJson;
  try {
    swaggerJson = JSON.parse(fileContent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(
      `Invalid JSON format in Swagger file: '${fullPath}'.\nCheck for syntax errors.`
    );
  }

  if (!swaggerJson.openapi || !swaggerJson.paths) {
    throw new Error(
      `Invalid OpenAPI schema in file: '${fullPath}'.\nMissing 'openapi' or 'paths' property.`
    );
  }

  return swaggerJson;
};

export const validateDirectory = (dir: string, name: string) => {
  const directory = resolve(process.cwd(), dir);

  try {
    accessSync(directory, constants.R_OK);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(
      `Can't resolve the ${name}: '${directory}'.
      Directory does not exist or you do not have access rights`
    );
  }

  if (!lstatSync(directory).isDirectory()) {
    throw new Error(
      `Can't resolve the ${name}: '${directory}'.
      The specified path exists but is not a directory`
    );
  }
};
