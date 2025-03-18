import { Options } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';

export type CompilerOptions = Partial<Options>;

export type CachedSchemas = Array<{ name: string; capitalized: string }>;

export type Path = string;

export type Config = Record<string, JSONSchema4>;

export type Route = Record<Path, Config>;

export type Result = string;
