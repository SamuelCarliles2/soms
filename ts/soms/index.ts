import * as fs from "fs";
import * as ts from "@typescript-eslint/parser";
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/typescript-estree";

import * as somstree from "./somstree";


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
            let prog: TSESTree.Program = <TSESTree.Program>ts.parse(s.source);
            Somspiler.handleProgram(prog);
            // console.log(typeof t);
            // console.log(JSON.stringify(ts.parse(s.source), null, "    "));
        }
    }

    static handleProgram(p: TSESTree.Program) : any {
        for(let s of p.body) {
            // s will be a TSESTree.Statement
            if(s.type === AST_NODE_TYPES.ExportNamedDeclaration) {
                if(s.declaration) {
                    let r = Somspiler.handleExportDeclaration(s.declaration);

                    console.log("r: " + JSON.stringify(r, null, "  "));
                }
                else {
                    throw new Error("Don't know what to do with null declaration in type " + s.type);
                }
            }
            else {
                throw new Error("Don't know what to do with Statement of type " + s.type);
            }
        }
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
                throw new Error("Don't know what to do with declaration of type " + d.type);
        }

        return result;
    }

    static handleClassDeclaration(s: TSESTree.ClassDeclaration) : somstree.SomsClass {
        if(!s.id?.name) {
            throw new Error("No name for class: " + s.id);
        }

        return new somstree.SomsClass(
            {
                name: s.id?.name
            }
        );
    }

    static handleClassBody(b: TSESTree.ClassBody) : any {
        for(let e of b.body) {
        }
    }

    static handleClassElement(e: TSESTree.ClassElement) : somstree.SomsField {
        if(e.type === AST_NODE_TYPES.ClassProperty) {
            return Somspiler.handleClassProperty(e);
        }
        else {
            throw new Error("Don't know what to do with class element type " + e.type);
        }
    }

    static handleClassProperty(p: TSESTree.ClassProperty) : somstree.SomsField {
        throw new Error("Here's p: " + JSON.stringify(p, null, "  "));

        if((!p.computed) && p.static && p.readonly) {
        }
        else if((!p.computed) && (!p.static) && (!p.readonly)) {

        }
        else {
            throw new Error("Don't know what to do with class element type " + p.type);
        }
    }

    static handleExpression(e: TSESTree.Expression) : string | number {
        let result: string | number;

        switch (e.type) {
            case AST_NODE_TYPES.Identifier:
                result = (<TSESTree.Identifier>e).name;
                break;
            // case AST_NODE_TYPES.Literal:
            //     result = (<TSESTree.Literal>e).value;
            //     break;
            default:
                throw new Error("Don't know what to do with expression " + e);
        }

        return result;
    }

    static handleTSEnumDeclaration(s: TSESTree.TSEnumDeclaration) : somstree.SomsEnum {
        return new somstree.SomsEnum(
            {
                name: s.id.name,
                values: s.members.map(
                    m => {
                        if(m.computed) {
                            throw new Error("Encountered enum expression: " + s.id);
                        }

                        return m.id.toString();
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


Somspiler.fromFiles(process.argv.slice(2)).foo();
