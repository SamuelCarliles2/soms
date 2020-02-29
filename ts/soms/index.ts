import * as fs from "fs";
import * as ts from "@typescript-eslint/parser";
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/typescript-estree";

import * as somstree from "./somstree";
import {SomsNodeType, SomsValue} from "./somstree";


export interface SourceSource {
    source: string;
    filename: string | null;
}

export class Somspiler {
    readonly sources: SourceSource[];

    constructor(sources: SourceSource[]) {
        this.sources = sources;
    }

    foo() : void {
        for(let s of this.sources) {
            console.log("***** PARSING " + s.filename + " *****");
            let program: TSESTree.Program = <TSESTree.Program>ts.parse(s.source);
            let pkg: somstree.SomsPackage = Somspiler.handleProgram(program);
            console.log("pkg: " + JSON.stringify(pkg, null, "  "));
        }
    }

    static handleProgram(p: TSESTree.Program) : somstree.SomsPackage {
        let enums : somstree.SomsEnum[] = [];
        let classes: somstree.SomsClass[] = [];

        for(let s of p.body) {
            // s will be a TSESTree.Statement
            if(s.type === AST_NODE_TYPES.ExportNamedDeclaration) {
                if(s.declaration) {
                    let r = Somspiler.handleExportDeclaration(s.declaration);

                    if(r.somsNodeType === SomsNodeType.SOMSENUM) {
                        enums.push(<somstree.SomsEnum>r);
                    }
                    else if(r.somsNodeType === SomsNodeType.SOMSCLASS) {
                        classes.push(<somstree.SomsClass>r);
                    }
                    else {
                        throw new Error("Don't know what to do with declaration " + toJson(s.declaration));
                    }
                }
                else {
                    throw new Error("Don't know what to do with null declaration in statement " + toJson(s));
                }
            }
            else {
                throw new Error("Don't know what to do with statement " + toJson(s));
            }
        }

        return new somstree.SomsPackage(
            {
                name: "TODO",
                enums: enums,
                classes: classes
            }
        );
    }

    static handleExportDeclaration(d: TSESTree.ExportDeclaration) : somstree.SomsEnum | somstree.SomsClass {
        let result;

        switch(d.type) {
            case AST_NODE_TYPES.ClassDeclaration:
                result = Somspiler.handleClassDeclaration(d);
                break;
            case AST_NODE_TYPES.TSEnumDeclaration:
                result = Somspiler.handleTSEnumDeclaration(d);
                break;
            default:
                throw new Error("Don't know what to do with declaration " + toJson(d));
        }

        return result;
    }

    static handleClassDeclaration(s: TSESTree.ClassDeclaration) : somstree.SomsClass {
        if(!s.id?.name) {
            throw new Error("No name for class " + toJson(s));
        }

        return new somstree.SomsClass(
            {
                name: s.id?.name,
                fields: s.body.body.map(
                    (e) => {
                        if(e.type === AST_NODE_TYPES.ClassProperty) {
                            return Somspiler.handleClassProperty(e);
                        }
                        else {
                            throw new Error("Don't know what to do with class element " + toJson(e));
                        }
                    }
                )
            }
        );
    }

    static handleMemberExpression(e: TSESTree.MemberExpression) : [somstree.SomsTypeIdentifier, SomsValue] {
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

    static isBoolean(v: boolean | number | string | RegExp | null) : v is boolean {
        return typeof v === "boolean";
    }

    static isNumber(v: boolean | number | string | RegExp | null) : v is number {
        return typeof v === "number";
    }

    static isString(v: boolean | number | string | RegExp | null) : v is string {
        return typeof v === "string";
    }

    static handleLiteral(l: TSESTree.Literal) : [somstree.SomsTypeIdentifier, SomsValue] {
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

    static handleClassProperty(p: TSESTree.ClassProperty) : somstree.SomsField {
        if((!p.computed) && p.static && p.readonly && p.value) {
            if(p.value.type === AST_NODE_TYPES.Literal) {
                let [t, v] = Somspiler.handleLiteral(p.value);

                return new somstree.SomsField(
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

                return new somstree.SomsField(
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
                throw new Error("Don't know what to do with class property " + toJson(p));
            }
        }
        else if((!p.computed) && (!p.static) && (!p.readonly) && p.typeAnnotation) {
            let f = Somspiler.handleTypeNode(p.typeAnnotation.typeAnnotation);

            return new somstree.SomsField(
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
            throw new Error("Don't know what to do with class property " + toJson(p));
        }
    }

    static handleTypeNode(n: TSESTree.TypeNode) : somstree.WeakSomsField {
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
                throw new Error("Don't know what to do with TypeNode " + toJson(n));
        }
    }

    static handleArrayType(t: TSESTree.TSArrayType, depth?: number) : somstree.WeakSomsField {
        let d : number = depth ? depth : 0;

        if(t.elementType.type === AST_NODE_TYPES.TSArrayType) {
            return Somspiler.handleArrayType(t.elementType, d + 1);
        }
        else {
            return {
                name: "",
                typeIdentifier: Somspiler.handleTypeNode(t.elementType).typeIdentifier,
                dimensionality: d + 1
            };
        }
    }

    static handleTSTypeReference(r: TSESTree.TSTypeReference) : somstree.SomsTypeIdentifier {
        if(r.typeName.type === AST_NODE_TYPES.Identifier) {
            const name = (<TSESTree.Identifier>r.typeName).name;

            if(somstree.isSomsPrimitiveType(name)) {
                return name;
            }
            else {
                return { name: name };
            }
        }
        else {
            throw new Error("Don't know what to do with TSTypeReference " + toJson(r));
        }
    }

    static handleTSEnumDeclaration(s: TSESTree.TSEnumDeclaration) : somstree.SomsEnum {
        return new somstree.SomsEnum(
            {
                name: s.id.name,
                values: s.members.map(
                    m => {
                        if(m.computed) {
                            throw new Error("Encountered enum expression " + toJson(s));
                        }

                        return (<TSESTree.Identifier>m.id).name;
                    }
                )
            }
        );
    }

    static fromFiles(filenames: string[]) : Somspiler {
        return new Somspiler(
            filenames.map(
                f => <SourceSource>{
                    source: fs.readFileSync(f).toString(),
                    filename: f
                }
            )
        );
    }

    static fromSources(sourceStrings: string[]) : Somspiler {
        return new Somspiler(
            sourceStrings.map(
                s => <SourceSource>{
                    source: s,
                    filename: null
                }
            )
        );
    }
}

function toJson(v: any) {
    return JSON.stringify(v, null, "  ");
}

Somspiler.fromFiles(process.argv.slice(2)).foo();
