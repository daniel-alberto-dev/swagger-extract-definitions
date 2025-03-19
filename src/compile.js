"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const json_schema_to_typescript_1 = require("json-schema-to-typescript");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const transformResponse = (title, config) => Object.keys(config).map((key) => {
    const item = config[key];
    let schema = item?.content?.['application/json']?.schema || item?.schema;
    if (schema?.$ref) {
        return schema;
    }
    return {
        title: `${title}Status${schema?.title ? (0, utils_1.normalizeTitle)(schema.title) : key}`,
        ...schema,
    };
});
const transformSchemaLevel = (title, schema, list) => {
    const result = list.reduce((acc, { name, capitalized }) => {
        let properties = schema[name];
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
                        ...(0, utils_1.createSchemaObject)(newTitle, undefined),
                        oneOf: transformResponse(newTitle, properties),
                    }
                    : { ...propertiesSchema, title: newTitle };
        }
        return acc;
    }, {});
    return Object.keys(result).length ? result : undefined;
};
const transformMethodLevel = (title, config, ignoreHead) => Object.entries(config).reduce((acc, [method, schema = {}]) => {
    const parsedMethod = method.toUpperCase();
    const methods = [parsedMethod];
    methods.forEach((method) => {
        if (!ignoreHead || method !== 'HEAD') {
            const newTitle = title + (0, utils_1.capitalize)(method);
            const list = constants_1.methodsWithBody.includes(method)
                ? constants_1.cachedSchemasWithBody
                : constants_1.cachedSchemas;
            const properties = transformSchemaLevel(newTitle, schema, list);
            acc[method] = {
                ...(0, utils_1.createSchemaObject)(newTitle, properties),
                description: schema.description,
            };
        }
    });
    return acc;
}, {});
const transformRootLevel = (routes, ignoreHead) => Object.entries(routes).reduce((acc, [route, config]) => {
    const parsedRoute = transformPath(route);
    const title = (0, utils_1.generateEndpointName)(parsedRoute);
    const properties = transformMethodLevel(title, config, ignoreHead);
    acc[parsedRoute] = (0, utils_1.createSchemaObject)(undefined, properties);
    return acc;
}, {});
const transformPath = (path) => path.replace(/\{([^}]+)\}/g, ':$1');
const compile = async (routes, definitions, ignoreHead, compilerOptions = {}) => {
    const options = (0, utils_1.patchCompilerOptions)(compilerOptions, definitions);
    const properties = transformRootLevel(routes, ignoreHead);
    const schema = { ...(0, utils_1.createSchemaObject)(constants_1.rootName, properties), definitions };
    const text = await (0, json_schema_to_typescript_1.compile)(schema, constants_1.rootName, options);
    return {
        text: text
            .replace(/\}\n\//g, '}\n\n/')
            .replace(/\}\nexport /g, '}\n\nexport ')
            .replace(/export type/g, '\nexport type'),
        schema,
    };
};
exports.compile = compile;
