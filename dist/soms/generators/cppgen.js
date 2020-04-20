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
var CppGenerator = /** @class */ (function () {
    function CppGenerator() {
        this.primitiveMap = new Map([
            ["string", "std::string"],
            ["int64", "int64_t"],
            ["boolean", "bool"],
            ["double", "double"],
        ]);
        this.UDTs = new Map();
        this.transpilationBuffer = "";
        this.fileName = "";
        this.headerGuard = "#pragma once\n";
        this.stdIncludes = "#include <string>\n#include <vector>\n#include <algorithm>\n#include <iterator>\n";
        this.engineIncludes = "#include <KataCore/JsonSerializer.h>\n#include <json/reader.h>\n\n";
        this.TAB = 4;
    }
    CppGenerator.prototype.generate = function (somspackages) {
        var _this = this;
        return somspackages.map(function (p) { return _this.generateSource(p); });
    };
    CppGenerator.prototype.generateSource = function (somsPackage) {
        this.transpilationBuffer =
            this.headerGuard
                + this.stdIncludes
                + this.engineIncludes
                + "namespace "
                + somsPackage.name.replace(/\./g, "::")
                + " {\n";
        this.transpilationBuffer += this.transpileEnums(somsPackage);
        this.transpileClasses(somsPackage);
        this.transpilationBuffer += "};\n";
        return {
            source: this.transpilationBuffer,
            filename: somsPackage.name + ".hpp"
        };
    };
    CppGenerator.prototype.padString = function (str, width) {
        // return str.padStart(str.length+width);
        return " ".repeat(width) + str;
    };
    CppGenerator.prototype.transpileEnums = function (somsPackage) {
        var _this = this;
        return somsPackage.enums.map(function (somsEnum) {
            // TODO: move this side-effect up
            _this.UDTs.set(somsEnum.name, "enum");
            return _this.padString("enum " + somsEnum.name + " {" + somsEnum.name + "NONE,", _this.TAB)
                + somsEnum.values.map(function (v) { return somsEnum.name + "_" + v; }).join(",")
                + "};\n\n"
                //this string array will be placed in class definitions where the relevant enum type is referenced
                + _this.padString("static std::string " + somsEnum.name + "StrArray[] = {\"\",", _this.TAB)
                + somsEnum.values.map(function (v) { return "\"" + v + "\""; }).join(",") + "};\n";
        }).join("\n\n");
    };
    CppGenerator.prototype.resolveDimensionality = function (resolvedType, dimensionality) {
        var resolvedTypeDimensionality = "";
        switch (dimensionality) {
            case 0:
                resolvedTypeDimensionality = "" + resolvedType;
                break;
            case 1:
                resolvedTypeDimensionality = "std::vector<" + resolvedType + ">";
                break;
            case 2:
                resolvedTypeDimensionality = "std::vector<std::vector<" + resolvedType + ">>";
                break;
            case 3:
                resolvedTypeDimensionality = "std::vector<std::vector<std::vector<" + resolvedType + ">>>";
                break;
        }
        return resolvedTypeDimensionality;
    };
    CppGenerator.prototype.transpileClasses = function (somsPackage) {
        for (var _i = 0, _a = somsPackage.classes; _i < _a.length; _i++) {
            var somsClass = _a[_i];
            this.UDTs.set(somsClass.name, "class");
            this.transpilationBuffer += this.padString("class " + somsClass.name + " {\n    public:\n", this.TAB);
            for (var _b = 0, _c = somsClass.fields; _b < _c.length; _b++) {
                var somsField = _c[_b];
                var resolvedType = this.resolveType(somsField.typeIdentifier.name);
                //getters/setters
                this.transpilationBuffer += this.padString("const " + this.resolveDimensionality(resolvedType, somsField.dimensionality) + " get" + somsField.name + "() const {\n", this.TAB * 2);
                this.transpilationBuffer += this.padString("return this->" + somsField.name + "." + somsField.name + ";\n", this.TAB * 3);
                this.transpilationBuffer += this.padString("};\n\n", this.TAB * 2);
                if (!somsField.staticConst) {
                    this.transpilationBuffer += this.padString("void set" + somsField.name + "(" + this.resolveDimensionality(resolvedType, somsField.dimensionality) + " value) {\n", this.TAB * 2);
                    this.transpilationBuffer += this.padString("this->" + somsField.name + "." + somsField.name + " = value;\n", this.TAB * 3);
                    this.transpilationBuffer += this.padString("};\n", this.TAB * 2);
                }
            }
            this.transpilationBuffer += this.padString("private:\n", this.TAB);
            for (var _d = 0, _e = somsClass.fields; _d < _e.length; _d++) {
                var somsField = _e[_d];
                var resolvedType = this.resolveType(somsField.typeIdentifier.name);
                var fieldDefinition = "";
                this.transpilationBuffer += this.padString("struct Field" + somsField.name + " {\n", this.TAB * 2);
                if (somsField.staticConst) {
                    fieldDefinition += ""; //TO BE IMPLEMENTED, const causes encapsulating containers, i.e. vector operator= to be deleted. Maybe a copy constructor for field struct type?
                }
                fieldDefinition += this.resolveDimensionality(resolvedType, somsField.dimensionality) + " ";
                if (somsField.name)
                    fieldDefinition += "" + somsField.name;
                if (somsField.staticConst) {
                    if (somsField.dimensionality == 0) {
                        if (this.UDTs.get(resolvedType) != "enum") {
                            fieldDefinition += (resolvedType == "std::string")
                                ? " = \"" + somsField.staticConstValue + "\""
                                : " = " + somsField.staticConstValue;
                        }
                    }
                }
                if (this.UDTs.get(somsField.typeIdentifier.name) == "enum") {
                    fieldDefinition += "= " + somsField.typeIdentifier.name + "(0)";
                }
                fieldDefinition += ";\n";
                this.transpilationBuffer += this.padString(fieldDefinition, this.TAB * 3);
                this.transpilationBuffer += this.padString("bool optional = " + somsField.optional + ";\n", this.TAB * 3);
                this.transpilationBuffer += this.padString("} " + somsField.name + ";\n", this.TAB * 2);
            }
            this.transpilationBuffer += this.padString("bool bToJson = false;\n", this.TAB * 2);
            this.transpilationBuffer += this.padString("public:\n", this.TAB);
            this.transpilationBuffer += this.buildClassSerdeMethods(somsClass.name, somsClass.name, somsClass.fields);
            this.transpilationBuffer += this.padString("};\n\n", this.TAB);
        }
    };
    CppGenerator.prototype.buildClassSerdeMethods = function (name, type, fields) {
        var _this = this;
        var serializeMethod = this.padString("void Serialize(JsonSerializer& s) {\n", this.TAB * 2);
        fields.forEach(function (field) {
            var fieldIdentifier = field.typeIdentifier.name;
            if (_this.primitiveMap.has(fieldIdentifier) || (_this.UDTs.has(fieldIdentifier) && _this.UDTs.get(fieldIdentifier) != "enum")) {
                serializeMethod += _this.padString("s.Serialize(\"" + field.name + "\", " + field.name + "." + field.name + ");\n", _this.TAB * 3);
            }
            else {
                serializeMethod += _this.padString("if (this->bToJson) {\n", _this.TAB * 3);
                serializeMethod += _this.padString("unsigned int " + fieldIdentifier + "enumIndex = 0;\n", _this.TAB * 4);
                serializeMethod += _this.padString("unsigned int " + fieldIdentifier + "length = sizeof(" + fieldIdentifier + "StrArray) / sizeof(std::string);\n", _this.TAB * 4);
                serializeMethod += _this.padString("for (int i = 0; i < " + fieldIdentifier + "length; i++) {\n", _this.TAB * 4);
                serializeMethod += _this.padString("if (" + fieldIdentifier + "StrArray[i].find(" + fieldIdentifier + "StrArray[" + field.name + "." + field.name + "], 0) != std::string::npos) {\n", _this.TAB * 5);
                serializeMethod += _this.padString(field.typeIdentifier.name + "enumIndex = i;\n", _this.TAB * 6);
                serializeMethod += _this.padString("break;\n", _this.TAB * 6);
                serializeMethod += _this.padString("}\n", _this.TAB * 5);
                serializeMethod += _this.padString("}\n", _this.TAB * 4);
                serializeMethod += _this.padString("s.Serialize(\"" + field.name + "\"," + fieldIdentifier + "StrArray[" + field.name + "." + field.name + "]);\n", _this.TAB * 4);
                serializeMethod += _this.padString("}\n", _this.TAB * 3);
                serializeMethod += _this.padString("else {\n", _this.TAB * 3);
                serializeMethod += _this.padString("std::string enumValue;\n", _this.TAB * 4);
                serializeMethod += _this.padString("s.Serialize(\"" + field.name + "\", enumValue);\n", _this.TAB * 4);
                serializeMethod += _this.padString("unsigned int " + fieldIdentifier + "enumIndex = 0;\n", _this.TAB * 4);
                serializeMethod += _this.padString("unsigned int " + fieldIdentifier + "length = sizeof(" + fieldIdentifier + "StrArray) / sizeof(std::string);\n", _this.TAB * 4);
                serializeMethod += _this.padString("for (int i = 0; i < " + fieldIdentifier + "length; i++) {\n", _this.TAB * 4);
                serializeMethod += _this.padString("if (" + fieldIdentifier + "StrArray[i].find(enumValue, 0) != std::string::npos) {\n", _this.TAB * 5);
                serializeMethod += _this.padString(fieldIdentifier + "enumIndex = i;\n", _this.TAB * 6);
                serializeMethod += _this.padString("break;\n", _this.TAB * 6);
                serializeMethod += _this.padString("}\n", _this.TAB * 5);
                serializeMethod += _this.padString("}\n", _this.TAB * 4);
                serializeMethod += _this.padString(field.name + "." + field.name + " = " + fieldIdentifier + "(" + fieldIdentifier + "enumIndex);\n", _this.TAB * 4);
                serializeMethod += _this.padString("}\n", _this.TAB * 3);
            }
        });
        serializeMethod += this.padString("};\n\n", this.TAB * 2);
        var serdeMethodFromJson = this.padString("bool fromJson(const char* json) {\n", this.TAB * 2);
        serdeMethodFromJson += this.padString("Json::Value  root;\n\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("Json::Reader reader;\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("if (!reader.parse(json, root)) {}\n\n", this.TAB * 3);
        fields.forEach(function (field) {
            serdeMethodFromJson += _this.padString("if (!root.isMember(\"" + field.name + "\")) {\n", _this.TAB * 3);
            serdeMethodFromJson += _this.padString("if (!this->" + field.name + ".optional) {\n", _this.TAB * 4);
            serdeMethodFromJson += _this.padString("return false;\n", _this.TAB * 5);
            serdeMethodFromJson += _this.padString("}\n", _this.TAB * 4);
            serdeMethodFromJson += _this.padString("}\n", _this.TAB * 3);
        });
        serdeMethodFromJson += this.padString("this->bToJson = false;\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("JsonSerializer s(false);\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("s.JsonValue = root;\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("this->Serialize(s);\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("return true;\n", this.TAB * 3);
        serdeMethodFromJson += this.padString("};\n\n", this.TAB * 2);
        var serdeMethodToJson = this.padString("Json::Value toJson() {\n", this.TAB * 2);
        serdeMethodToJson += this.padString("JsonSerializer s(true);\n", this.TAB * 3);
        serdeMethodToJson += this.padString("this->bToJson = true;\n", this.TAB * 3);
        fields.forEach(function (field) {
            var fieldIdentifier = field.typeIdentifier.name;
            if (_this.primitiveMap.has(fieldIdentifier) || (_this.UDTs.has(fieldIdentifier) && _this.UDTs.get(fieldIdentifier) != "enum")) {
                serdeMethodToJson += _this.padString("s.Serialize(\"" + field.name + "\", " + field.name + "." + field.name + ");\n", _this.TAB * 3);
            }
            else {
                serdeMethodToJson += _this.padString("s.Serialize(\"" + field.name + "\", " + field.typeIdentifier.name + "StrArray[" + field.name + "." + field.name + "]);\n", _this.TAB * 3);
            }
        });
        serdeMethodToJson += this.padString("return s.JsonValue;\n", this.TAB * 3);
        serdeMethodToJson += this.padString("}\n", this.TAB * 2);
        return serializeMethod + serdeMethodFromJson + serdeMethodToJson;
    };
    CppGenerator.prototype.resolveType = function (typeIdentifier) {
        var resolvedType = "";
        var mapValue = this.primitiveMap.get(typeIdentifier);
        if (mapValue == undefined) {
            if (this.UDTs.get(typeIdentifier) == undefined) {
                var error = "Undefined type " + typeIdentifier + "\n";
                throw new Error(error);
            }
            else {
                resolvedType = typeIdentifier;
            }
        }
        else {
            resolvedType = mapValue;
        }
        return resolvedType;
    };
    return CppGenerator;
}());
exports.CppGenerator = CppGenerator;
//# sourceMappingURL=cppgen.js.map