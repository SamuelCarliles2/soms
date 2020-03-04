import * as fs from "fs";
import * as ts from "@typescript-eslint/parser";
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/typescript-estree";

import {
    // isSomsPrimitiveType, isSomsEnumOrClassIdentifier,
    SomsNodeType, SomsPackage, SomsClass, SomsEnum,
    SomsField, SomsFieldLite,
    SomsTypeIdentifier, SomsNumberType, SomsPrimitiveType,
    SomsBooleanTypeIdentifier, SomsInt64TypeIdentifier, SomsDoubleTypeIdentifier,
    SomsStringTypeIdentifier, SomsUserDefinedTypeIdentifier,
    SomsEnumTypeIdentifier, SomsClassTypeIdentifier,
    SomsValue, SomsUdtType, isSomsPrimitiveType
} from "./somstree";

import {FileSource, PackageSource} from "./somsgenerator";


export interface SomsConfig {
    readonly packageRoot?: string;
    readonly outDir?: string;
    readonly generatorModuleNames?: string[];
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
                            if(f instanceof SomsUserDefinedTypeIdentifier) {
                                const udtType = enumNames.indexOf(f.typeIdentifier.name) >= 0
                                    ? SomsUdtType.SOMSENUM
                                    : (
                                        classNames.indexOf(f.typeIdentifier.name) >= 0
                                        ? SomsUdtType.SOMSCLASS
                                            : null
                                    );

                                if(udtType === null) {
                                    throw new Error(
                                        "Unresolved type " + f.typeIdentifier.name
                                        + " encountered in field " + f.name
                                        + " in class " + c.name
                                    );
                                }

                                return new SomsField(
                                    {
                                        name: f.name,
                                        typeIdentifier: f.typeIdentifier,
                                        udtType: udtType,
                                        dimensionality: f.dimensionality,
                                        optional: f.optional,
                                        staticConst: f.staticConst,
                                        staticConstValue: f.staticConstValue
                                    }
                                );
                            }
                            else {
                                return f;
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
            {
                name: (<TSESTree.Identifier>e.object).name
            },
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
    readonly generatorModuleNames: string[];

    constructor(cfg?: SomsConfig) {
        this.packageRoot = cfg?.packageRoot ? cfg.packageRoot : "./";
        this.outDir = cfg?.outDir ? cfg.outDir : "./";
        this.generatorModuleNames
            = cfg?.generatorModuleNames ? cfg.generatorModuleNames : [];
    }
}
