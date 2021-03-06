/*
MIT License

Copyright (c) 2020 Samuel Carliles, Marcus Hansen, and Promit Roy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as fs from "fs";
import * as ts from "@typescript-eslint/parser";
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/typescript-estree";

import {
    isSomsPrimitiveType,
    SomsTypeIdentifier, SomsPrimitiveType,
    SomsInt64TypeIdentifier, SomsDoubleTypeIdentifier,
    SomsBooleanTypeIdentifier, SomsStringTypeIdentifier,
    SomsUserDefinedTypeIdentifier, SomsEnumTypeIdentifier, SomsClassTypeIdentifier,
    SomsNodeType, SomsEnum, SomsClass, SomsField, SomsPackage,
    SomsFieldLite, SomsValue
} from "./somstree";

import {FileSource, PackageSource} from "./somsgenerator";


export interface SomsGeneratorConfig {
    readonly importPath: string;
    readonly className: string;
    readonly outDir: string;
}

export interface SomsConfig {
    readonly packageRoot?: string;
    readonly outDir?: string;
    readonly generators: SomsGeneratorConfig[];
}

export class Somspiler {
    constructor(readonly sources: PackageSource[]) {}

    static toPackageSource(s: FileSource, cfg: ConcreteSomsConfig)
        : PackageSource
    {
        return {
            source: s.source,
            packageName:
                s.filename
                .replace(new RegExp(cfg.packageRoot + "/*"), "")
                .replace(new RegExp("\\.soms$"), "")
                .replace(new RegExp("/*index$"), "")
                .replace(new RegExp("/+", "g"), ".")
        };
    }

    public somspile() : SomsPackage[] {
        return this.sources.map(
            s => Somspiler.handleProgram(ts.parse(s.source), s.packageName)
        );
    }

    static handleProgram(p: TSESTree.Program, packageName: string)
        : SomsPackage
    {
        let enums : SomsEnum[] = [];
        let classes: SomsClass[] = [];

        for(let s of p.body) {
            // s will be a TSESTree.Statement
            if(s.type === AST_NODE_TYPES.ExportNamedDeclaration) {
                if(s.declaration) {
                    let r = Somspiler.handleExportDeclaration(s.declaration);

                    if(r.somsNodeType === SomsNodeType.SOMSENUM) {
                        enums.push(<SomsEnum>r);
                    }
                    else if(r.somsNodeType === SomsNodeType.SOMSCLASS) {
                        classes.push(<SomsClass>r);
                    }
                    else {
                        throw new Error(
                            "Don't know what to do with declaration "
                            + toJson(s.declaration)
                        );
                    }
                }
                else {
                    throw new Error(
                        "Don't know what to do with null declaration "
                        + "in statement " + toJson(s)
                    );
                }
            }
            else {
                throw new Error(
                    "Don't know what to do with statement " + toJson(s)
                );
            }
        }

        return Somspiler.resolveUdts(
            new SomsPackage(
                {
                    name: packageName,
                    enums: enums,
                    classes: classes
                }
            )
        );
    }

    static checkUnique(enumNames: string[], classNames: string[]) : void {
        let h: any = {};

        for(let e of enumNames) {
            if(e in h) {
                throw new Error("Enum name already in use: " + e);
            }
            else {
                h[e] = 1;
            }
        }

        for(let c of classNames) {
            if(c in h) {
                throw new Error("Class name already in use: " + c);
            }
            else {
                h[c] = 1;
            }
        }

        return;
    }

    static resolveUdts(p: SomsPackage) : SomsPackage {
        const enumNames = p.enums.map(e => e.name);
        const classNames = p.classes.map(c => c.name);

        this.checkUnique(enumNames, classNames);

        const classes = p.classes.map(
            c => new SomsClass(
                {
                    name: c.name,
                    fields: c.fields.map(
                        f => {
                            if(f.typeIdentifier instanceof SomsPrimitiveType) {
                                return f;
                            }
                            else if(f.typeIdentifier instanceof SomsUserDefinedTypeIdentifier) {
                                const t = enumNames.indexOf(f.typeIdentifier.name) >= 0
                                    ? new SomsEnumTypeIdentifier(f.typeIdentifier.name)
                                    : (
                                        classNames.indexOf(f.typeIdentifier.name) >= 0
                                            ? new SomsClassTypeIdentifier(f.typeIdentifier.name)
                                            : null
                                    );

                                if(t === null) {
                                    throw new Error(
                                        "Unresolved type " + f.typeIdentifier.name
                                        + " encountered in field " + f.name
                                        + " in class " + c.name
                                    );
                                }

                                return new SomsField(
                                    {
                                        name: f.name,
                                        typeIdentifier: t,
                                        dimensionality: f.dimensionality,
                                        optional: f.optional,
                                        staticConst: f.staticConst,
                                        staticConstValue: f.staticConstValue
                                    }
                                );
                            }
                            else {
                                throw new Error(
                                    "Unresolved type " + f.typeIdentifier.name
                                    + " encountered in field " + f.name
                                    + " in class " + c.name
                                );
                            }
                        }
                    )
                }
            )
        );

        return new SomsPackage(
            {
                name: p.name,
                enums: p.enums,
                classes: classes
            }
        );
    }

    static handleExportDeclaration(d: TSESTree.ExportDeclaration)
        : SomsEnum | SomsClass
    {
        let result;

        switch(d.type) {
            case AST_NODE_TYPES.ClassDeclaration:
                result = Somspiler.handleClassDeclaration(d);
                break;
            case AST_NODE_TYPES.TSEnumDeclaration:
                result = Somspiler.handleTSEnumDeclaration(d);
                break;
            default:
                throw new Error(
                    "Don't know what to do with declaration " + toJson(d)
                );
        }

        return result;
    }

    static handleClassDeclaration(s: TSESTree.ClassDeclaration) : SomsClass
    {
        if(!s.id?.name) {
            throw new Error("No name for class " + toJson(s));
        }

        return new SomsClass(
            {
                name: s.id?.name,
                fields: s.body.body.map(
                    (e) => {
                        if(e.type === AST_NODE_TYPES.ClassProperty) {
                            return Somspiler.handleClassProperty(e);
                        }
                        else {
                            throw new Error(
                                "Don't know what to do with class element "
                                + toJson(e)
                            );
                        }
                    }
                )
            }
        );
    }

    static handleMemberExpression(e: TSESTree.MemberExpression)
        : [SomsTypeIdentifier, SomsValue]
    {
        return [
            new SomsEnumTypeIdentifier((<TSESTree.Identifier>e.object).name),
            {
                enumName: (<TSESTree.Identifier>e.object).name,
                value: (<TSESTree.Identifier>e.property).name
            }
        ];
    }

    static handleLiteral(l: TSESTree.Literal) : [SomsTypeIdentifier, SomsValue]
    {
        if(isBoolean(l.value)) {
            return [new SomsBooleanTypeIdentifier(), l.value];
        }
        else if(isString(l.value)) {
            return [new SomsStringTypeIdentifier(), l.value];
        }
        else if(isNumber(l.value) && l.raw) {
            return [
                l.raw.indexOf(".") >= 0
                    ? new SomsDoubleTypeIdentifier()
                    : new SomsInt64TypeIdentifier(),
                l.value
            ];
        }
        else {
            throw new Error("Don't know what to do with literal " + toJson(l));
        }
    }

    static handleClassProperty(p: TSESTree.ClassProperty) : SomsField {
        if((!p.computed) && p.static && p.readonly && p.value) {
            if(p.value.type === AST_NODE_TYPES.Literal) {
                let [t, v] = Somspiler.handleLiteral(p.value);

                return new SomsField(
                    {
                        name: (<TSESTree.Identifier>p.key).name,
                        typeIdentifier: t,
                        dimensionality: 0,
                        optional: p.optional ? p.optional : false,
                        staticConst: true,
                        staticConstValue: v
                    }
                );
            }
            else if(p.value.type === AST_NODE_TYPES.MemberExpression) {
                let [t, v] = Somspiler.handleMemberExpression(p.value);

                return new SomsField(
                    {
                        name: (<TSESTree.Identifier>p.key).name,
                        typeIdentifier: t,
                        dimensionality: 0,
                        optional: p.optional ? p.optional : false,
                        staticConst: true,
                        staticConstValue: v
                    }
                );
            }
            else {
                throw new Error(
                    "Don't know what to do with class property " + toJson(p)
                );
            }
        }
        else if(
            (!p.computed)
            && (!p.static)
            && (!p.readonly)
            && p.typeAnnotation
        )
        {
            let f = Somspiler.handleTypeNode(p.typeAnnotation.typeAnnotation);

            return new SomsField(
                {
                    name: (<TSESTree.Identifier>p.key).name,
                    typeIdentifier: f.typeIdentifier,
                    dimensionality: f.dimensionality ? f.dimensionality : 0,
                    optional: p.optional ? p.optional : false,
                    staticConst: false
                }
            );
        }
        else {
            throw new Error(
                "Don't know what to do with class property " + toJson(p)
            );
        }
    }

    static handleTypeNode(n: TSESTree.TypeNode) : SomsFieldLite {
        switch (n.type) {
            case AST_NODE_TYPES.TSArrayType:
                return Somspiler.handleArrayType(n);
            case AST_NODE_TYPES.TSBooleanKeyword:
                return {
                    name: "",
                    typeIdentifier: new SomsBooleanTypeIdentifier()
                };
            case AST_NODE_TYPES.TSStringKeyword:
                return {
                    name: "",
                    typeIdentifier: new SomsStringTypeIdentifier()
                };
            case AST_NODE_TYPES.TSTypeReference:
                return {
                    name: "",
                    typeIdentifier: Somspiler.handleTSTypeReference(n)
                };
            default:
                throw new Error(
                    "Don't know what to do with TypeNode " + toJson(n)
                );
        }
    }

    static handleArrayType(t: TSESTree.TSArrayType, depth?: number)
        : SomsFieldLite
    {
        let d : number = depth ? depth : 0;

        if(t.elementType.type === AST_NODE_TYPES.TSArrayType) {
            return Somspiler.handleArrayType(t.elementType, d + 1);
        }
        else {
            return {
                name: "",
                typeIdentifier: Somspiler.handleTypeNode(
                    t.elementType
                ).typeIdentifier,
                dimensionality: d + 1
            };
        }
    }

    static handleTSTypeReference(r: TSESTree.TSTypeReference)
        : SomsTypeIdentifier
    {
        if(r.typeName.type === AST_NODE_TYPES.Identifier) {
            const name = (<TSESTree.Identifier>r.typeName).name;

            if(isSomsPrimitiveType(name)) {
                switch (name) {
                    case "boolean":
                        return new SomsBooleanTypeIdentifier();
                    case "int64":
                        return new SomsInt64TypeIdentifier();
                    case "double":
                        return new SomsDoubleTypeIdentifier();
                    case "string":
                        return new SomsStringTypeIdentifier();
                    default:
                        throw new Error(
                            "Don't recognize primitive type " + name
                        );
                }
            }
            else {
                return new SomsUserDefinedTypeIdentifier(name);
            }
        }
        else {
            throw new Error(
                "Don't know what to do with TSTypeReference " + toJson(r)
            );
        }
    }

    static handleTSEnumDeclaration(s: TSESTree.TSEnumDeclaration) : SomsEnum
    {
        return new SomsEnum(
            {
                name: s.id.name,
                values: s.members.map(
                    m => {
                        if(m.computed) {
                            throw new Error(
                                "Encountered enum expression " + toJson(s)
                            );
                        }

                        return (<TSESTree.Identifier>m.id).name;
                    }
                )
            }
        );
    }

    static fromConfig(cfg: SomsConfig) : Somspiler {
        let cCfg = new ConcreteSomsConfig(cfg);
        const filenames: string[] = findSoms(cCfg.packageRoot);

        return new Somspiler(
            filenames.map(
                f => Somspiler.toPackageSource(
                    <FileSource>{
                        source: fs.readFileSync(f).toString(),
                        filename: f
                    },
                    cCfg
                )
            )
        );
    }

    static fromSources(sources: PackageSource[]) : Somspiler {
        return new Somspiler(sources);
    }
}

function isBoolean(v: boolean | number | string | RegExp | null)
    : v is boolean
{
    return typeof v === "boolean";
}

function isNumber(v: boolean | number | string | RegExp | null)
    : v is number
{
    return typeof v === "number";
}

function isString(v: boolean | number | string | RegExp | null)
    : v is string
{
    return typeof v === "string";
}

function findSoms(curDir: string) : string[] {
    const entries = fs.readdirSync(curDir, { withFileTypes: true });

    const files: string[] = entries
    .filter(e => e.isFile() && e.name.endsWith(".soms"))
    .map(e => curDir + "/" + e.name);

    const dirs: string[][] = entries
    .filter(e => e.isDirectory())
    .map(e => findSoms(curDir + "/" + e.name));

    return files.concat(
        dirs.length > 0
            ? dirs.reduce((acc, val) => acc.concat(val))
            : []
    );
}

export function toJson(v: any) {
    return JSON.stringify(v, null, "  ");
}

export class ConcreteSomsConfig implements SomsConfig {
    readonly packageRoot: string;
    readonly outDir: string;
    readonly generators: SomsGeneratorConfig[];

    constructor(cfg?: SomsConfig) {
        this.packageRoot = cfg?.packageRoot ? cfg.packageRoot : "./";
        this.outDir = cfg?.outDir ? cfg.outDir : "./";
        this.generators = cfg?.generators ? cfg.generators : [];
    }
}
