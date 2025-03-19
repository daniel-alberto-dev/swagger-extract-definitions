#!/usr/bin/env node
'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const openapi_schema_to_json_schema_1 = __importDefault(require("@openapi-contrib/openapi-schema-to-json-schema"));
const save_1 = require("./save");
const compile_1 = require("./compile");
const prettify_1 = require("./prettify");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
__exportStar(require("./types"), exports);
(async () => {
    const openApiSpec = JSON.parse((0, fs_1.readFileSync)(constants_1.targetFile, 'utf-8'));
    const jsonSchema = (0, openapi_schema_to_json_schema_1.default)(openApiSpec);
    const modifiedJsonSchema = (0, utils_1.replaceRefs)(jsonSchema);
    const routes = modifiedJsonSchema['paths'];
    const definitions = modifiedJsonSchema['components']['schemas'];
    const [{ text }, prettier] = await Promise.all([
        (0, compile_1.compile)(routes, definitions, constants_1.isIgnoreHead, constants_1.compilerOptions),
        (0, prettify_1.prettify)(constants_1.compilerOptions),
    ]);
    const formatted = await prettier(constants_1.bannerComment + text);
    await (0, save_1.save)(formatted, constants_1.output);
})();
