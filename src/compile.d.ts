import { JSONSchema4 } from 'json-schema';
import { CompilerOptions } from './types';
export declare const compile: (routes: any, definitions: JSONSchema4, ignoreHead: boolean, compilerOptions?: CompilerOptions) => Promise<{
    text: string;
    schema: {
        definitions: JSONSchema4;
        id?: string | undefined;
        $ref?: string | undefined;
        $schema?: import("json-schema").JSONSchema4Version | undefined;
        title?: string | undefined;
        description?: string | undefined;
        default?: import("json-schema").JSONSchema4Type | undefined;
        multipleOf?: number | undefined;
        maximum?: number | undefined;
        exclusiveMaximum?: boolean | undefined;
        minimum?: number | undefined;
        exclusiveMinimum?: boolean | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        pattern?: string | undefined;
        additionalItems?: boolean | JSONSchema4 | undefined;
        items?: JSONSchema4 | JSONSchema4[] | undefined;
        maxItems?: number | undefined;
        minItems?: number | undefined;
        uniqueItems?: boolean | undefined;
        maxProperties?: number | undefined;
        minProperties?: number | undefined;
        required?: boolean | string[] | undefined;
        additionalProperties?: boolean | JSONSchema4 | undefined;
        properties?: {
            [k: string]: JSONSchema4;
        } | undefined;
        patternProperties?: {
            [k: string]: JSONSchema4;
        } | undefined;
        dependencies?: {
            [k: string]: JSONSchema4 | string[];
        } | undefined;
        enum?: import("json-schema").JSONSchema4Type[] | undefined;
        type?: import("json-schema").JSONSchema4TypeName | import("json-schema").JSONSchema4TypeName[] | undefined;
        allOf?: JSONSchema4[] | undefined;
        anyOf?: JSONSchema4[] | undefined;
        oneOf?: JSONSchema4[] | undefined;
        not?: JSONSchema4 | undefined;
        extends?: string | string[] | undefined;
        format?: string | undefined;
    };
}>;
