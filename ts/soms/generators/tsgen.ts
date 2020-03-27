/*
MIT License

Copyright (c) 2020 Samuel Carliles

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

import {
    FileSource, SomsGenerator, SomsGeneratorOptions
} from "../somsgenerator";

import {
    SomsEnum, SomsField, SomsClass, SomsPackage,
    SomsTypeIdentifier, SomsPrimitiveType, SomsNumberType,
    SomsEnumTypeIdentifier, SomsClassTypeIdentifier,
    SomsValue
} from "../somstree";


export class TsGenerator implements SomsGenerator
{
    public generate(packages: SomsPackage[], options?: SomsGeneratorOptions)
        : FileSource[]
    {
        return packages.map(p => TsGenerator.generateFileSource(p));
    }

    static generateFileSource(p: SomsPackage) : FileSource {
        const enumSrc = p.enums?.length
            ? p.enums.map(e => TsGenerator.generateEnumSource(e)).join("\n\n")
            : null;
        const classesSrc = p.classes?.length
            ? p.classes.map(c => TsGenerator.generateClassSource(c)).join("\n\n")
            : null;

        return {
            source: (enumSrc ? enumSrc + "\n" : "") + (classesSrc ? classesSrc : ""),
            filename: p.name.replace(new RegExp("\\.", "g"), "/") + "/index.ts"
        };
    }

    static generateEnumSource(e: SomsEnum) : string {
        return "export enum " + e.name + " {\n"
            + e.values.map(v => "    " + v + " = \"" + v + "\"").join(",\n")
            + "\n}\n\n"
            + "export const " + e.name + "Map : any = {\n"
            + e.values.map(v => "    " + v + ": " + e.name + "." + v).join(",\n")
            + "\n};\n";
    }

    static generateClassSource(c: SomsClass) : string {
        const interfaceName = c.name + "Lite";

        return TsGenerator.generateInterfaceSource(c, interfaceName) + "\n"
            + "export class " + c.name + " implements " + interfaceName + " {\n"
            + c.fields.filter(f => f.staticConst)
            .map(f => "    " + TsGenerator.generateClassFieldDeclarationSource(f)).join("")
            + "\n"
            + c.fields.filter(f => !f.staticConst)
            .map(f => "    " + TsGenerator.generateClassFieldDeclarationSource(f)).join("")
            + "\n"
            + TsGenerator.generateConstructor(c, interfaceName)
            + "\n"
            + TsGenerator.generateFromJson(c, interfaceName)
            + "\n"
            + TsGenerator.generateToJSON(c)
            + "}\n";
    }

    static generateToJSON(c: SomsClass) : string {
        return "    toJSON() : any {\n"
            + "        return {\n"
            + c.fields.filter(f => (!f.staticConst) || (!f.optional)).map(
                f => "            " + f.name + ": this." + f.name
            ).join(",\n")
            + "\n        };\n"
            + "    }\n";
    }

    static generateFromJson(c: SomsClass, interfaceName: string) : string {
        return "    static fromJson(v: string | any) : " + c.name + " {\n"
            + "        if(typeof v === \"string\") {\n"
            + "            return " + c.name + ".fromJson(JSON.parse(v));\n"
            + "        }\n"
            + "        else {\n"
            + "            return new " + c.name + "({\n"
            + c.fields.filter(f => !(f.staticConst && f.optional)).map(
                f => " ".repeat(20)
                    + TsGenerator.generateInterfaceFieldConstruction(f, "v")
            ).join(",\n")
            + "\n                }\n"
            + "            );\n"
            + "        }\n"
            + "    }\n";
    }

    static generateInterfaceFieldConstruction(f: SomsField, sourceName: string) : string {
        if(f.typeIdentifier instanceof SomsPrimitiveType) {
            return f.name + ": " + sourceName + "." + f.name;
        }
        else if(f.typeIdentifier instanceof SomsEnumTypeIdentifier) {
            if(f.dimensionality > 0) {
                // TODO: TEST THIS
                return f.name + ": " + sourceName + "." + f.name
                    + ".map("
                    + "v => v.map(".repeat(f.dimensionality - 1)
                    + "v => " + f.typeIdentifier.name + "Map[v]"
                    + ")".repeat(f.dimensionality);
            }
            else {
                return f.name + ": "
                    + f.typeIdentifier.name + "Map[v." + f.name + "]";
            }
        }
        else if(f.typeIdentifier instanceof SomsClassTypeIdentifier) {
            if(f.dimensionality > 0) {
                return f.name + ": " + sourceName + "." + f.name
                    + ".map("
                    + "v => v.map(".repeat(f.dimensionality - 1)
                    + "(v: any) => " + f.typeIdentifier.name + ".fromJson(v)"
                    + ")".repeat(f.dimensionality);
            }
            else {
                return f.name + ": " + f.typeIdentifier.name + ".fromJson("
                    + sourceName + "." + f.name + ")";
            }
        }
        else {
            throw new Error(
                "Unresolved field type " + f.typeIdentifier.name
                + " in field " + f.name
            );
        }
    }

    static generateConstructor(c: SomsClass, interfaceName: string) : string {
        return "    constructor(o: " + interfaceName + ") {\n"
            + c.fields.filter(f => !f.staticConst).map(f =>
                "        "
                + TsGenerator.generateClassFieldAssignmentSource(f, "o")
            ).join("\n")
            + "\n    }\n";
    }

    static generateClassFieldAssignmentSource(f: SomsField, sourceName: string) : string {
        const prefix = "this." + f.name + " = ";
        const sourceField = sourceName + "." + f.name;
        const nullOrUndefined = "(" + sourceField + " === null || " + sourceField + " === undefined)";
        const defaultValue = f.dimensionality > 0 ? "[]".repeat(f.dimensionality) : "null";

        return f.optional
            ? prefix + nullOrUndefined + " ? " + defaultValue + " : " + sourceField + ";"
            : prefix + sourceField + ";";
    }

    static generateClassFieldDeclarationSource(f: SomsField) : string {
        if(f.staticConst) {
            if(f.staticConstValue === null) {
                throw new Error("Got null static const value in field " + f.name + ".");
            }

            // TODO: Document the unfortunate necessity
            //  to make required static const fields not static
            return (f.optional ? "static " : "")
                + "readonly " + f.name
                + (f.optional ? "?" : "")
                + " = " + TsGenerator.generateValueString(f.staticConstValue)
                + ";\n";
        }
        else if(f.dimensionality > 0) {
            return "readonly " + f.name + ": "
                + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                + "[]".repeat(f.dimensionality)
                + ";\n";
        }
        else {
            return "readonly " + f.name + (
                f.optional
                    ? ("?: "
                        + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                        + " | null;\n"
                    )
                    : (": "
                        + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                        + ";\n"
                    )
            );
        }
    }

    static generateValueString(v: SomsValue) : string {
        if(typeof v === "string") {
            return "\"" + v + "\"";
        }
        else if(typeof v === "boolean") {
            return "" + v;
        }
        else if (typeof v === "number") {
            return "" + v;
        }
        else {
            return v.enumName + "." + v.value;
        }
    }

    static generateInterfaceSource(c: SomsClass, interfaceName: string) : string {
        const staticConst = c.fields.filter(f => f.staticConst).map(
            f => {
                const d = TsGenerator.generateInterfaceFieldDeclarationSource(f);
                return d.length > 0 ? "    " + d : "";
            }
        ).filter(s => s.length > 0).join("\n");
        const instance = c.fields.filter(f => !f.staticConst).map(
            f => {
                const d = TsGenerator.generateInterfaceFieldDeclarationSource(f);
                return d.length > 0 ? "    " + d : "";
            }
        ).filter(s => s.length > 0).join("\n");

        return "export interface " + interfaceName + " {\n"
            + (staticConst.length > 0 ? staticConst + "\n" : "")
            + (staticConst.length > 0 && instance.length > 0 ? "\n" : "")
            + (instance.length > 0 ? instance + "\n" : "")
            + "}\n";
    }

    static generateInterfaceFieldDeclarationSource(f: SomsField) : string {
        if(f.staticConst) {
            return (!f.optional)
                ? (
                    "readonly " + f.name + ": "
                    +  TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + ";"
                )
                : "";
        }
        else if(f.dimensionality > 0) {
            return f.name + (f.optional ? "?: " : ": ")
                + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                + "[]".repeat(f.dimensionality)
                + ";";
        }
        else {
            return f.name + (
                f.optional
                    ? ("?: "
                        + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                        + " | null;"
                    )
                    : (": "
                        + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                        + ";"
                )
            );
        }
    }

    static generateTypeIdentifierString(t: SomsTypeIdentifier) : string {
        if(t instanceof SomsPrimitiveType) {
            return t instanceof SomsNumberType ? "number" : t.name;
        }
        else {
            // it must be SomsEnumIdentifier or SomsClassIdentifier
            return t.name;
        }
    }
}
