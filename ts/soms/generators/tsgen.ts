import {FileSource, SomsGeneratorOptions, SomsGenerator} from "../somsgenerator";
import {
    isSomsEnumOrClassIdentifier, isSomsNumberType, isSomsPrimitiveType, isSomsPrimitiveValue,
    SomsPackage, SomsEnum, SomsField, SomsClass, SomsTypeIdentifier, SomsValue, isString,
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
            filename: p.name.replace(".", "/") + "/index.ts"
        };
    }

    static generateEnumSource(e: SomsEnum) : string {
        return "export enum " + e.name + " {\n"
            + e.values.map(v => "    " + v + " = \"" + v + "\"").join(",\n")
            + "\n}\n";
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
            + TsGenerator.generateToJson(c)
            + "\n"
            + TsGenerator.generateProjectToAny(c)
            + "}\n";
    }

    static generateToJson(c: SomsClass, leftPad?: "") : string {
        return "    toJson(space?: string | number) : string {\n"
            + "        return JSON.stringify(this.projectToAny(), null, space);\n"
            + "    }\n";
    }

    static generateProjectToAny(c: SomsClass) : string {
        return "    projectToAny() : any {\n"
            + "        return {\n"
            + c.fields.filter(f => (!f.staticConst) || (!f.optional)).map(
                f => {
                    const prefix = " ".repeat(12) + f.name + " : ";

                    if(f.dimensionality > 0) {
                        return prefix + "[".repeat(f.dimensionality) + "]".repeat(f.dimensionality)
                    }
                    else {
                        return prefix + "null";
                    }
                }
            ).join(",\n")
            + "\n"
            + "        };\n"
            + "    }\n";
    }

    static generateFromJson(c: SomsClass, interfaceName: string) : string {
        return "    static fromJson(s: string) : " + c.name + " {\n"
            + "        return new "
            + c.name + "(<" + interfaceName + ">JSON.parse(s));\n"
            + "    }\n";
    }

    static generateConstructor(c: SomsClass, interfaceName: string) : string {
        return "    constructor(o: " + interfaceName + ") {\n"
            + c.fields.filter(f => !f.staticConst).map(f =>
                "        "
                + TsGenerator.generateClassFieldAssignmentSource(f, "o") + "\n"
            ).join("")
            + "    }\n";
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
        else {
            return "readonly " + f.name + ": "
                + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                + "[]".repeat(f.dimensionality)
                + ";\n";
        }
    }

    static generateValueString(v: SomsValue) : string {
        // TODO: make this not dumb
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
        ).join("");
        const normal = c.fields.filter(f => !f.staticConst).map(
            f => {
                const d = TsGenerator.generateInterfaceFieldDeclarationSource(f);
                return d.length > 0 ? "    " + d : "";
            }
        ).join("");

        return "export interface " + interfaceName + " {\n"
            + (staticConst.length > 0 ? staticConst + "\n" : "")
            + normal
            + "\n    projectToAny() : any;"
            + "}\n";
    }

    static generateInterfaceFieldDeclarationSource(f: SomsField) : string {
        const suffix = TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
            + "[]".repeat(f.dimensionality)
            + ";\n";

        if(f.staticConst) {
            return (!f.optional)
                ? "readonly " + f.name + ": " + suffix
                : "";
        }
        else {
            return f.name + (f.optional ? "?: " : ": ") + suffix;
        }
    }

    static generateTypeIdentifierString(t: SomsTypeIdentifier) : string {
        if(isSomsPrimitiveType(t)) {
            return isSomsNumberType(t) ? "number" : t;
        }
        else if(isSomsEnumOrClassIdentifier(t)) {
            return t.name;
        }
        else {
            throw new Error("Don't know what to do with TypeIdentifier " + t);
        }
    }
}
