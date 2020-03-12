"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var somstree_1 = require("../somstree");
var TsGenerator = /** @class */ (function () {
    function TsGenerator() {
    }
    TsGenerator.prototype.generate = function (packages, options) {
        return packages.map(function (p) { return TsGenerator.generateFileSource(p); });
    };
    TsGenerator.generateFileSource = function (p) {
        var _a, _b;
        var enumSrc = ((_a = p.enums) === null || _a === void 0 ? void 0 : _a.length) ? p.enums.map(function (e) { return TsGenerator.generateEnumSource(e); }).join("\n\n")
            : null;
        var classesSrc = ((_b = p.classes) === null || _b === void 0 ? void 0 : _b.length) ? p.classes.map(function (c) { return TsGenerator.generateClassSource(c); }).join("\n\n")
            : null;
        return {
            source: (enumSrc ? enumSrc + "\n" : "") + (classesSrc ? classesSrc : ""),
            filename: p.name.replace(new RegExp("\\.", "g"), "/") + "/index.ts"
        };
    };
    TsGenerator.generateEnumSource = function (e) {
        return "export enum " + e.name + " {\n"
            + e.values.map(function (v) { return "    " + v + " = \"" + v + "\""; }).join(",\n")
            + "\n}\n\n"
            + "export const " + e.name + "Map : any = {\n"
            + e.values.map(function (v) { return "    " + v + ": " + e.name + "." + v; }).join(",\n")
            + "\n};\n";
    };
    TsGenerator.generateClassSource = function (c) {
        var interfaceName = c.name + "Lite";
        return TsGenerator.generateInterfaceSource(c, interfaceName) + "\n"
            + "export class " + c.name + " implements " + interfaceName + " {\n"
            + c.fields.filter(function (f) { return f.staticConst; })
                .map(function (f) { return "    " + TsGenerator.generateClassFieldDeclarationSource(f); }).join("")
            + "\n"
            + c.fields.filter(function (f) { return !f.staticConst; })
                .map(function (f) { return "    " + TsGenerator.generateClassFieldDeclarationSource(f); }).join("")
            + "\n"
            + TsGenerator.generateConstructor(c, interfaceName)
            + "\n"
            + TsGenerator.generateFromJson(c, interfaceName)
            + "\n"
            + TsGenerator.generateToJSON(c)
            + "}\n";
    };
    TsGenerator.generateToJSON = function (c) {
        return "    toJSON() : any {\n"
            + "        return {\n"
            + c.fields.filter(function (f) { return (!f.staticConst) || (!f.optional); }).map(function (f) { return "            " + f.name + ": this." + f.name; }).join(",\n")
            + "\n        };\n"
            + "    }\n";
    };
    TsGenerator.generateFromJson = function (c, interfaceName) {
        return "    static fromJson(v: string | any) : " + c.name + " {\n"
            + "        if(typeof v === \"string\") {\n"
            + "            return " + c.name + ".fromJson(JSON.parse(v));\n"
            + "        }\n"
            + "        else {\n"
            + "            return new " + c.name + "({\n"
            + c.fields.filter(function (f) { return !(f.staticConst && f.optional); }).map(function (f) { return " ".repeat(20)
                + TsGenerator.generateInterfaceFieldConstruction(f, "v"); }).join(",\n")
            + "\n                }\n"
            + "            );\n"
            + "        }\n"
            + "    }\n";
    };
    TsGenerator.generateInterfaceFieldConstruction = function (f, sourceName) {
        if (f.typeIdentifier instanceof somstree_1.SomsPrimitiveType) {
            return f.name + ": " + sourceName + "." + f.name;
        }
        else if (f.typeIdentifier instanceof somstree_1.SomsEnumTypeIdentifier) {
            if (f.dimensionality > 0) {
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
        else if (f.typeIdentifier instanceof somstree_1.SomsClassTypeIdentifier) {
            if (f.dimensionality > 0) {
                return f.name + ": " + sourceName + "." + f.name
                    + ".map("
                    + "v => v.map(".repeat(f.dimensionality - 1)
                    + "(v: any) => " + f.typeIdentifier.name + ".fromJson(v)"
                    + ")".repeat(f.dimensionality);
            }
            else {
                return f.name + ": " + f.typeIdentifier.name + ".fromJson(v)";
            }
        }
        else {
            throw new Error("Unresolved field type " + f.typeIdentifier.name
                + " in field " + f.name);
        }
    };
    TsGenerator.generateConstructor = function (c, interfaceName) {
        return "    constructor(o: " + interfaceName + ") {\n"
            + c.fields.filter(function (f) { return !f.staticConst; }).map(function (f) {
                return "        "
                    + TsGenerator.generateClassFieldAssignmentSource(f, "o");
            }).join("\n")
            + "\n    }\n";
    };
    TsGenerator.generateClassFieldAssignmentSource = function (f, sourceName) {
        var prefix = "this." + f.name + " = ";
        var sourceField = sourceName + "." + f.name;
        var nullOrUndefined = "(" + sourceField + " === null || " + sourceField + " === undefined)";
        var defaultValue = f.dimensionality > 0 ? "[]".repeat(f.dimensionality) : "null";
        return f.optional
            ? prefix + nullOrUndefined + " ? " + defaultValue + " : " + sourceField + ";"
            : prefix + sourceField + ";";
    };
    TsGenerator.generateClassFieldDeclarationSource = function (f) {
        if (f.staticConst) {
            if (f.staticConstValue === null) {
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
        else if (f.dimensionality > 0) {
            return "readonly " + f.name + ": "
                + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                + "[]".repeat(f.dimensionality)
                + ";\n";
        }
        else {
            return "readonly " + f.name + (f.optional
                ? ("?: "
                    + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + " | null;\n")
                : (": "
                    + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + ";\n"));
        }
    };
    TsGenerator.generateValueString = function (v) {
        if (typeof v === "string") {
            return "\"" + v + "\"";
        }
        else if (typeof v === "boolean") {
            return "" + v;
        }
        else if (typeof v === "number") {
            return "" + v;
        }
        else {
            return v.enumName + "." + v.value;
        }
    };
    TsGenerator.generateInterfaceSource = function (c, interfaceName) {
        var staticConst = c.fields.filter(function (f) { return f.staticConst; }).map(function (f) {
            var d = TsGenerator.generateInterfaceFieldDeclarationSource(f);
            return d.length > 0 ? "    " + d : "";
        }).filter(function (s) { return s.length > 0; }).join("\n");
        var instance = c.fields.filter(function (f) { return !f.staticConst; }).map(function (f) {
            var d = TsGenerator.generateInterfaceFieldDeclarationSource(f);
            return d.length > 0 ? "    " + d : "";
        }).filter(function (s) { return s.length > 0; }).join("\n");
        return "export interface " + interfaceName + " {\n"
            + (staticConst.length > 0 ? staticConst + "\n" : "")
            + (staticConst.length > 0 && instance.length > 0 ? "\n" : "")
            + (instance.length > 0 ? instance + "\n" : "")
            + "}\n";
    };
    TsGenerator.generateInterfaceFieldDeclarationSource = function (f) {
        if (f.staticConst) {
            return (!f.optional)
                ? ("readonly " + f.name + ": "
                    + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + ";")
                : "";
        }
        else if (f.dimensionality > 0) {
            return f.name + (f.optional ? "?: " : ": ")
                + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                + "[]".repeat(f.dimensionality)
                + ";";
        }
        else {
            return f.name + (f.optional
                ? ("?: "
                    + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + " | null;")
                : (": "
                    + TsGenerator.generateTypeIdentifierString(f.typeIdentifier)
                    + ";"));
        }
    };
    TsGenerator.generateTypeIdentifierString = function (t) {
        if (t instanceof somstree_1.SomsPrimitiveType) {
            return t instanceof somstree_1.SomsNumberType ? "number" : t.name;
        }
        else {
            // it must be SomsEnumIdentifier or SomsClassIdentifier
            return t.name;
        }
    };
    return TsGenerator;
}());
exports.TsGenerator = TsGenerator;
//# sourceMappingURL=tsgen.js.map