import { JSONSchema4 } from 'json-schema';
import { compile as compileJson } from 'json-schema-to-typescript';

import {
  cachedSchemas,
  cachedSchemasWithBody,
  methodsWithBody,
  rootName,
} from './constants';
import {
  capitalize,
  createSchemaObject,
  generateEndpointName,
  normalizeTitle,
  patchCompilerOptions,
} from './utils';
import { CachedSchemas, CompilerOptions, Config, Route } from './types';

const transformResponse = (title: string, config: Config): JSONSchema4[] =>
  Object.keys(config).map((key) => {
    const item = config[key];

    const schema = item?.content?.['application/json']?.schema || item?.schema;

    if (schema?.$ref) {
      return schema;
    }

    return {
      title: `${title}Status${schema?.title ? normalizeTitle(schema.title) : key}`,
      ...schema,
    };
  });

const transformSchemaLevel = (
  title: string,
  schema: JSONSchema4,
  list: CachedSchemas
) => {
  const result = list.reduce<JSONSchema4>((acc, { name, capitalized }) => {
    const properties = schema[name];

    if (properties) {
      const newTitle = properties?.title || title + capitalized;
      const propertiesSchema = properties.content?.['application/json']?.schema;

      if (name === 'parameters' && Array.isArray(properties)) {
        const queryParams = properties.filter((param) => param.in === 'query');
        const pathParams = properties.filter((param) => param.in === 'path');

        if (queryParams.length) {
          acc['Querystring'] = {
            title: title + 'Querystring',
            type: 'object',
            properties: {},
            additionalProperties: false,
          };
          queryParams.forEach((param) => {
            acc['Querystring'].properties[param.name] = param.schema || {};
            if (param.required) {
              acc['Querystring'].required = acc['Querystring'].required || [];
              acc['Querystring'].required.push(param.name);
            }
          });
        }

        if (pathParams.length) {
          acc['Params'] = {
            title: newTitle,
            type: 'object',
            properties: {},
            additionalProperties: false,
          };
          pathParams.forEach((param) => {
            acc['Params'].properties[param.name] = param.schema || {};
            if (param.required) {
              acc['Params'].required = acc['Params'].required || [];
              acc['Params'].required.push(param.name);
            }
          });
        }

        return acc;
      }

      acc[capitalized] =
        name === 'responses'
          ? {
              ...createSchemaObject(newTitle, undefined),
              oneOf: transformResponse(newTitle, properties),
            }
          : { ...propertiesSchema, title: newTitle };
    }

    return acc;
  }, {});

  return Object.keys(result).length ? result : undefined;
};

const transformMethodLevel = (
  title: string,
  config: Config,
  ignoreHead: boolean
): JSONSchema4 =>
  Object.entries(config).reduce<JSONSchema4>((acc, [method, schema = {}]) => {
    const parsedMethod = method.toUpperCase();
    const methods = [parsedMethod];

    methods.forEach((method) => {
      if (!ignoreHead || method !== 'HEAD') {
        const newTitle = title + capitalize(method);

        const list = methodsWithBody.includes(method)
          ? cachedSchemasWithBody
          : cachedSchemas;
        const properties = transformSchemaLevel(newTitle, schema, list);

        acc[method] = {
          ...createSchemaObject(newTitle, properties),
          description: schema.description,
        };
      }
    });

    return acc;
  }, {});

const transformRootLevel = (
  routes: Route[],
  ignoreHead: boolean
): JSONSchema4 =>
  Object.entries(routes).reduce<JSONSchema4>((acc, [route, config]) => {
    const parsedRoute = transformPath(route);

    const title = generateEndpointName(parsedRoute);
    const properties = transformMethodLevel(title, config, ignoreHead);

    acc[parsedRoute] = createSchemaObject(undefined, properties);

    return acc;
  }, {});

const transformPath = (path: string) => path.replace(/\{([^}]+)\}/g, ':$1');

export const compile = async (
  routes: Route[],
  definitions: JSONSchema4,
  ignoreHead: boolean,
  compilerOptions: CompilerOptions = {}
) => {
  const options = patchCompilerOptions(compilerOptions, definitions);

  const properties = transformRootLevel(routes, ignoreHead);
  const schema = { ...createSchemaObject(rootName, properties), definitions };

  const text = await compileJson(schema, rootName, options);

  return {
    text: text
      .replace(/\}\n\//g, '}\n\n/')
      .replace(/\}\nexport /g, '}\n\nexport ')
      .replace(/export type/g, '\nexport type'),
    schema,
  };
};
