import { Options } from 'prettier';
import { CompilerOptions, Result } from './types';
export declare const defaultPrettierOptions: Options;
export declare const prettify: (compilerOptions?: CompilerOptions) => Promise<(result: Result) => Promise<string>>;
