import * as fs from "fs";
import * as ts from "@typescript-eslint/parser";
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/typescript-estree";

import {
    isSomsEnumOrClassIdentifier, isSomsPrimitiveType,
    SomsClass, SomsEnum, SomsField, SomsNodeType, SomsPackage,
    SomsTypeIdentifier, SomsValue, WeakSomsField
} from "./somstree";


export interface SomsGenerator {
    gen(packages: SomsPackage[]) : FileSource[];
}

export interface SomsConfig {
    readonly packageRoot?: string;
    readonly outDir?: string;
    readonly generatorModuleNames?: string[];
}

export interface Source {
    readonly source: string;
}

export interface PackageSource extends Source {
    readonly source: string;
    readonly packageName: string;
}

export interface FileSource extends Source {
    readonly source: string;
    readonly filename: string;
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

        const result = new SomsPackage(
            {
                name: packageName,
                enums: enums,
                classes: classes
            }
        );

        Somspiler.checkTypeReferenceResolution(result);

        return result;
    }

    static checkTypeReferenceResolution(p: SomsPackage) : void {
        const names
            = p.enums.map(e => e.name).concat(p.classes.map(c => c.name));

        for(let c of p.classes) {
            for(let f of c.fields) {
                let t = f.typeIdentifier;

                if(
                    isSomsEnumOrClassIdentifier(t)
                    && names.indexOf(t.name) < 0
                ) {
                    throw new Error(
                        "Found unresolved type \"" + t.name
                        + "\" in field \"" + f.name
                        + "\" in class \"" + c.name + "\"."
                    );
                }
            }
        }
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
            {
                name: (<TSESTree.Identifier>e.object).name
            },
            {
                enumName: (<TSESTree.Identifier>e.object).name,
                value: (<TSESTree.Identifier>e.property).name
            }
        ];
    }

    static isBoolean(v: boolean | number | string | RegExp | null)
        : v is boolean
    {
        return typeof v === "boolean";
    }

    static isNumber(v: boolean | number | string | RegExp | null)
        : v is number
    {
        return typeof v === "number";
    }

    static isString(v: boolean | number | string | RegExp | null)
        : v is string
    {
        return typeof v === "string";
    }

    static handleLiteral(l: TSESTree.Literal) : [SomsTypeIdentifier, SomsValue]
    {
        if(Somspiler.isBoolean(l.value)) {
            return ["boolean", l.value];
        }
        else if(Somspiler.isString(l.value)) {
            return ["string", l.value];
        }
        else if(Somspiler.isNumber(l.value) && l.raw) {
            return [l.raw.indexOf(".") >= 0 ? "double" : "int64", l.value];
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

    static handleTypeNode(n: TSESTree.TypeNode) : WeakSomsField {
        switch (n.type) {
            case AST_NODE_TYPES.TSArrayType:
                return Somspiler.handleArrayType(n);
            case AST_NODE_TYPES.TSBooleanKeyword:
                return {
                    name: "",
                    typeIdentifier: "boolean"
                };
            case AST_NODE_TYPES.TSStringKeyword:
                return {
                    name: "",
                    typeIdentifier: "string"
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
        : WeakSomsField
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
                return name;
            }
            else {
                return { name: name };
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

function toJson(v: any) {
    return JSON.stringify(v, null, "  ");
}

class ConcreteSomsConfig implements SomsConfig {
    readonly packageRoot: string;
    readonly outDir: string;
    readonly generatorModuleNames: string[];

    constructor(cfg?: SomsConfig) {
        this.packageRoot = cfg?.packageRoot ? cfg.packageRoot : "./";
        this.outDir = cfg?.outDir ? cfg.outDir : "./";
        this.generatorModuleNames
            = cfg?.generatorModuleNames ? cfg.generatorModuleNames : [];
    }
}
