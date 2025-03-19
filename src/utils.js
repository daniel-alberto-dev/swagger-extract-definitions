"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDirectory = exports.validateSwaggerJson = exports.replaceRefs = exports.patchCompilerOptions = exports.createSchemaObject = exports.generateEndpointName = exports.normalizeTitle = exports.capitalize = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const generated = {};
const calcCwd = (cwd) => process.platform === 'win32' ? cwd.replace(/\\/g, '/') : cwd;
const capitalize = (str) => (str[0] ?? '').toUpperCase() + str.substring(1).toLowerCase();
exports.capitalize = capitalize;
const normalizeTitle = (title) => title
    .replace(/[^0-9a-z ]/gi, ' ')
    .split(' ')
    .filter((item) => item !== '')
    .map((item) => item[0].toUpperCase() + item.slice(1))
    .join('');
exports.normalizeTitle = normalizeTitle;
const generateEndpointName = (endpoint) => {
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
exports.generateEndpointName = generateEndpointName;
const createSchemaObject = (title, properties) => ({
    title,
    type: 'object',
    required: properties ? Object.keys(properties) : undefined,
    properties,
    additionalProperties: false,
});
exports.createSchemaObject = createSchemaObject;
const patchCompilerOptions = (options, definitions) => {
    const cwd = calcCwd(options.cwd || process.cwd());
    return {
        ...options,
        bannerComment: '',
        format: false,
        $refOptions: {
            ...options.$refOptions,
            resolve: {
                file: {
                    read: (file) => {
                        const key = file.url.substring(cwd.length);
                        const text = definitions[key] || definitions[key.slice(1)];
                        if (!text) {
                            const error = new Error(`swagger-extract-definitions: cannot resolve schema for ${file.url}`);
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
exports.patchCompilerOptions = patchCompilerOptions;
const replaceRefs = (schema) => {
    if (typeof schema === 'object' && schema !== null) {
        if (schema.$ref && typeof schema.$ref === 'string') {
            if (schema.$ref.startsWith('#/components/schemas/')) {
                schema.$ref = schema.$ref
                    .replace('#/components/schemas/', '')
                    .replace('/properties/', '#/properties/');
            }
        }
        Object.keys(schema).forEach((key) => {
            schema[key] = (0, exports.replaceRefs)(schema[key]);
        });
    }
    return schema;
};
exports.replaceRefs = replaceRefs;
const validateSwaggerJson = (filePath) => {
    const fullPath = (0, path_1.resolve)(process.cwd(), filePath);
    try {
        (0, fs_1.accessSync)(fullPath, fs_1.constants.R_OK);
    }
    catch (e) {
        throw new Error(`Can't resolve the Swagger file: '${fullPath}'.\nFile does not exist or you do not have access rights.`);
    }
    let fileContent;
    try {
        fileContent = (0, fs_1.readFileSync)(fullPath, 'utf-8');
    }
    catch (e) {
        throw new Error(`Can't read the Swagger file: '${fullPath}'.\nMake sure the file is accessible.`);
    }
    let swaggerJson;
    try {
        swaggerJson = JSON.parse(fileContent);
    }
    catch (e) {
        throw new Error(`Invalid JSON format in Swagger file: '${fullPath}'.\nCheck for syntax errors.`);
    }
    if (!swaggerJson.openapi || !swaggerJson.paths) {
        throw new Error(`Invalid OpenAPI schema in file: '${fullPath}'.\nMissing 'openapi' or 'paths' property.`);
    }
    return swaggerJson;
};
exports.validateSwaggerJson = validateSwaggerJson;
const validateDirectory = (dir, name) => {
    const directory = (0, path_1.resolve)(process.cwd(), dir);
    try {
        (0, fs_1.accessSync)(directory, fs_1.constants.R_OK);
    }
    catch (e) {
        throw new Error(`Can't resolve the ${name}: '${directory}'.
      Directory does not exist or you do not have access rights`);
    }
    if (!(0, fs_1.lstatSync)(directory).isDirectory()) {
        throw new Error(`Can't resolve the ${name}: '${directory}'.
      The specified path exists but is not a directory`);
    }
};
exports.validateDirectory = validateDirectory;
