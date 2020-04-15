"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ts = require("@typescript-eslint/parser");
var typescript_estree_1 = require("@typescript-eslint/typescript-estree");
var somstree_1 = require("./somstree");
var Somspiler = /** @class */ (function () {
    function Somspiler(sources) {
        this.sources = sources;
    }
    Somspiler.toPackageSource = function (s, cfg) {
        return {
            source: s.source,
            packageName: s.filename
                .replace(new RegExp(cfg.packageRoot + "/*"), "")
                .replace(new RegExp("\\.soms$"), "")
                .replace(new RegExp("/*index$"), "")
                .replace(new RegExp("/+", "g"), ".")
        };
    };
    Somspiler.prototype.somspile = function () {
        return this.sources.map(function (s) { return Somspiler.handleProgram(ts.parse(s.source), s.packageName); });
    };
    Somspiler.handleProgram = function (p, packageName) {
        var enums = [];
        var classes = [];
        for (var _i = 0, _a = p.body; _i < _a.length; _i++) {
            var s = _a[_i];
            // s will be a TSESTree.Statement
            if (s.type === typescript_estree_1.AST_NODE_TYPES.ExportNamedDeclaration) {
                if (s.declaration) {
                    var r = Somspiler.handleExportDeclaration(s.declaration);
                    if (r.somsNodeType === somstree_1.SomsNodeType.SOMSENUM) {
                        enums.push(r);
                    }
                    else if (r.somsNodeType === somstree_1.SomsNodeType.SOMSCLASS) {
                        classes.push(r);
                    }
                    else {
                        throw new Error("Don't know what to do with declaration "
                            + toJson(s.declaration));
                    }
                }
                else {
                    throw new Error("Don't know what to do with null declaration "
                        + "in statement " + toJson(s));
                }
            }
            else {
                throw new Error("Don't know what to do with statement " + toJson(s));
            }
        }
        return Somspiler.resolveUdts(new somstree_1.SomsPackage({
            name: packageName,
            enums: enums,
            classes: classes
        }));
    };
    Somspiler.checkUnique = function (enumNames, classNames) {
        var h = {};
        for (var _i = 0, enumNames_1 = enumNames; _i < enumNames_1.length; _i++) {
            var e = enumNames_1[_i];
            if (e in h) {
                throw new Error("Enum name already in use: " + e);
            }
            else {
                h[e] = 1;
            }
        }
        for (var _a = 0, classNames_1 = classNames; _a < classNames_1.length; _a++) {
            var c = classNames_1[_a];
            if (c in h) {
                throw new Error("Class name already in use: " + c);
            }
            else {
                h[c] = 1;
            }
        }
        return;
    };
    Somspiler.resolveUdts = function (p) {
        var enumNames = p.enums.map(function (e) { return e.name; });
        var classNames = p.classes.map(function (c) { return c.name; });
        this.checkUnique(enumNames, classNames);
        var classes = p.classes.map(function (c) { return new somstree_1.SomsClass({
            name: c.name,
            fields: c.fields.map(function (f) {
                if (f.typeIdentifier instanceof somstree_1.SomsPrimitiveType) {
                    return f;
                }
                else if (f.typeIdentifier instanceof somstree_1.SomsUserDefinedTypeIdentifier) {
                    var t = enumNames.indexOf(f.typeIdentifier.name) >= 0
                        ? new somstree_1.SomsEnumTypeIdentifier(f.typeIdentifier.name)
                        : (classNames.indexOf(f.typeIdentifier.name) >= 0
                            ? new somstree_1.SomsClassTypeIdentifier(f.typeIdentifier.name)
                            : null);
                    if (t === null) {
                        throw new Error("Unresolved type " + f.typeIdentifier.name
                            + " encountered in field " + f.name
                            + " in class " + c.name);
                    }
                    return new somstree_1.SomsField({
                        name: f.name,
                        typeIdentifier: t,
                        dimensionality: f.dimensionality,
                        optional: f.optional,
                        staticConst: f.staticConst,
                        staticConstValue: f.staticConstValue
                    });
                }
                else {
                    throw new Error("Unresolved type " + f.typeIdentifier.name
                        + " encountered in field " + f.name
                        + " in class " + c.name);
                }
            })
        }); });
        return new somstree_1.SomsPackage({
            name: p.name,
            enums: p.enums,
            classes: classes
        });
    };
    Somspiler.handleExportDeclaration = function (d) {
        var result;
        switch (d.type) {
            case typescript_estree_1.AST_NODE_TYPES.ClassDeclaration:
                result = Somspiler.handleClassDeclaration(d);
                break;
            case typescript_estree_1.AST_NODE_TYPES.TSEnumDeclaration:
                result = Somspiler.handleTSEnumDeclaration(d);
                break;
            default:
                throw new Error("Don't know what to do with declaration " + toJson(d));
        }
        return result;
    };
    Somspiler.handleClassDeclaration = function (s) {
        var _a, _b;
        if (!((_a = s.id) === null || _a === void 0 ? void 0 : _a.name)) {
            throw new Error("No name for class " + toJson(s));
        }
        return new somstree_1.SomsClass({
            name: (_b = s.id) === null || _b === void 0 ? void 0 : _b.name,
            fields: s.body.body.map(function (e) {
                if (e.type === typescript_estree_1.AST_NODE_TYPES.ClassProperty) {
                    return Somspiler.handleClassProperty(e);
                }
                else {
                    throw new Error("Don't know what to do with class element "
                        + toJson(e));
                }
            })
        });
    };
    Somspiler.handleMemberExpression = function (e) {
        return [
            new somstree_1.SomsEnumTypeIdentifier(e.object.name),
            {
                enumName: e.object.name,
                value: e.property.name
            }
        ];
    };
    Somspiler.handleLiteral = function (l) {
        if (isBoolean(l.value)) {
            return [new somstree_1.SomsBooleanTypeIdentifier(), l.value];
        }
        else if (isString(l.value)) {
            return [new somstree_1.SomsStringTypeIdentifier(), l.value];
        }
        else if (isNumber(l.value) && l.raw) {
            return [
                l.raw.indexOf(".") >= 0
                    ? new somstree_1.SomsDoubleTypeIdentifier()
                    : new somstree_1.SomsInt64TypeIdentifier(),
                l.value
            ];
        }
        else {
            throw new Error("Don't know what to do with literal " + toJson(l));
        }
    };
    Somspiler.handleClassProperty = function (p) {
        if ((!p.computed) && p.static && p.readonly && p.value) {
            if (p.value.type === typescript_estree_1.AST_NODE_TYPES.Literal) {
                var _a = Somspiler.handleLiteral(p.value), t = _a[0], v = _a[1];
                return new somstree_1.SomsField({
                    name: p.key.name,
                    typeIdentifier: t,
                    dimensionality: 0,
                    optional: p.optional ? p.optional : false,
                    staticConst: true,
                    staticConstValue: v
                });
            }
            else if (p.value.type === typescript_estree_1.AST_NODE_TYPES.MemberExpression) {
                var _b = Somspiler.handleMemberExpression(p.value), t = _b[0], v = _b[1];
                return new somstree_1.SomsField({
                    name: p.key.name,
                    typeIdentifier: t,
                    dimensionality: 0,
                    optional: p.optional ? p.optional : false,
                    staticConst: true,
                    staticConstValue: v
                });
            }
            else {
                throw new Error("Don't know what to do with class property " + toJson(p));
            }
        }
        else if ((!p.computed)
            && (!p.static)
            && (!p.readonly)
            && p.typeAnnotation) {
            var f = Somspiler.handleTypeNode(p.typeAnnotation.typeAnnotation);
            return new somstree_1.SomsField({
                name: p.key.name,
                typeIdentifier: f.typeIdentifier,
                dimensionality: f.dimensionality ? f.dimensionality : 0,
                optional: p.optional ? p.optional : false,
                staticConst: false
            });
        }
        else {
            throw new Error("Don't know what to do with class property " + toJson(p));
        }
    };
    Somspiler.handleTypeNode = function (n) {
        switch (n.type) {
            case typescript_estree_1.AST_NODE_TYPES.TSArrayType:
                return Somspiler.handleArrayType(n);
            case typescript_estree_1.AST_NODE_TYPES.TSBooleanKeyword:
                return {
                    name: "",
                    typeIdentifier: new somstree_1.SomsBooleanTypeIdentifier()
                };
            case typescript_estree_1.AST_NODE_TYPES.TSStringKeyword:
                return {
                    name: "",
                    typeIdentifier: new somstree_1.SomsStringTypeIdentifier()
                };
            case typescript_estree_1.AST_NODE_TYPES.TSTypeReference:
                return {
                    name: "",
                    typeIdentifier: Somspiler.handleTSTypeReference(n)
                };
            default:
                throw new Error("Don't know what to do with TypeNode " + toJson(n));
        }
    };
    Somspiler.handleArrayType = function (t, depth) {
        var d = depth ? depth : 0;
        if (t.elementType.type === typescript_estree_1.AST_NODE_TYPES.TSArrayType) {
            return Somspiler.handleArrayType(t.elementType, d + 1);
        }
        else {
            return {
                name: "",
                typeIdentifier: Somspiler.handleTypeNode(t.elementType).typeIdentifier,
                dimensionality: d + 1
            };
        }
    };
    Somspiler.handleTSTypeReference = function (r) {
        if (r.typeName.type === typescript_estree_1.AST_NODE_TYPES.Identifier) {
            var name_1 = r.typeName.name;
            if (somstree_1.isSomsPrimitiveType(name_1)) {
                switch (name_1) {
                    case "boolean":
                        return new somstree_1.SomsBooleanTypeIdentifier();
                    case "int64":
                        return new somstree_1.SomsInt64TypeIdentifier();
                    case "double":
                        return new somstree_1.SomsDoubleTypeIdentifier();
                    case "string":
                        return new somstree_1.SomsStringTypeIdentifier();
                    default:
                        throw new Error("Don't recognize primitive type " + name_1);
                }
            }
            else {
                return new somstree_1.SomsUserDefinedTypeIdentifier(name_1);
            }
        }
        else {
            throw new Error("Don't know what to do with TSTypeReference " + toJson(r));
        }
    };
    Somspiler.handleTSEnumDeclaration = function (s) {
        return new somstree_1.SomsEnum({
            name: s.id.name,
            values: s.members.map(function (m) {
                if (m.computed) {
                    throw new Error("Encountered enum expression " + toJson(s));
                }
                return m.id.name;
            })
        });
    };
    Somspiler.fromConfig = function (cfg) {
        var cCfg = new ConcreteSomsConfig(cfg);
        var filenames = findSoms(cCfg.packageRoot);
        return new Somspiler(filenames.map(function (f) { return Somspiler.toPackageSource({
            source: fs.readFileSync(f).toString(),
            filename: f
        }, cCfg); }));
    };
    Somspiler.fromSources = function (sources) {
        return new Somspiler(sources);
    };
    return Somspiler;
}());
exports.Somspiler = Somspiler;
function isBoolean(v) {
    return typeof v === "boolean";
}
function isNumber(v) {
    return typeof v === "number";
}
function isString(v) {
    return typeof v === "string";
}
function findSoms(curDir) {
    var entries = fs.readdirSync(curDir, { withFileTypes: true });
    var files = entries
        .filter(function (e) { return e.isFile() && e.name.endsWith(".soms"); })
        .map(function (e) { return curDir + "/" + e.name; });
    var dirs = entries
        .filter(function (e) { return e.isDirectory(); })
        .map(function (e) { return findSoms(curDir + "/" + e.name); });
    return files.concat(dirs.length > 0
        ? dirs.reduce(function (acc, val) { return acc.concat(val); })
        : []);
}
function toJson(v) {
    return JSON.stringify(v, null, "  ");
}
exports.toJson = toJson;
var ConcreteSomsConfig = /** @class */ (function () {
    function ConcreteSomsConfig(cfg) {
        this.packageRoot = (cfg === null || cfg === void 0 ? void 0 : cfg.packageRoot) ? cfg.packageRoot : "./";
        this.outDir = (cfg === null || cfg === void 0 ? void 0 : cfg.outDir) ? cfg.outDir : "./";
        this.generators = (cfg === null || cfg === void 0 ? void 0 : cfg.generators) ? cfg.generators : [];
    }
    return ConcreteSomsConfig;
}());
exports.ConcreteSomsConfig = ConcreteSomsConfig;
//# sourceMappingURL=somspiler.js.map