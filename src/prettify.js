"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettify = exports.defaultPrettierOptions = void 0;
const prettier_1 = require("prettier");
exports.defaultPrettierOptions = {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: 'none',
    useTabs: false,
};
const prettify = async (compilerOptions = {}) => {
    if (compilerOptions.format === false) {
        return async (result) => result;
    }
    let prettierOptions = compilerOptions.style || null;
    if (!prettierOptions) {
        prettierOptions = await (0, prettier_1.resolveConfig)(process.cwd());
    }
    if (!prettierOptions) {
        prettierOptions = exports.defaultPrettierOptions;
    }
    return async (result) => (0, prettier_1.format)(result, { parser: 'typescript', ...prettierOptions });
};
exports.prettify = prettify;
