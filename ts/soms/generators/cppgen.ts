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

import {FileSource, SomsGenerator, SomsGeneratorOptions} from "../somsgenerator";
import { SomsPackage, SomsEnum, SomsTypeIdentifier,  SomsField } from "../somstree";


export class CppGenerator implements SomsGenerator {
    private primitiveMap : Map<string, string> = new Map([
        ["string",  "std::string"],
        ["int64",   "int64_t"],
        ["boolean", "bool"],
        ["double",  "double"],
    ]);


    private UDTs          : Map<string, string> = new Map();

    private transpilationBuffer     : string = "";
    private fileName                : string = "";

    private readonly headerGuard    : string = "#pragma once\n";
    private readonly stdIncludes    : string = "#include <string>\n#include <vector>\n#include <algorithm>\n#include <iterator>\n";
    private readonly engineIncludes : string = "#include <JsonSerializer.h>\n#include <json/reader.h>\n\n";

    private readonly TAB            : number = 4;

    public generate(somspackages : Array<SomsPackage>) : FileSource[] {
        return somspackages.map(p => this.generateSource(p));
    }

    private generateSource(somsPackage : SomsPackage) : FileSource {
        this.transpilationBuffer =
            this.headerGuard
            + this.stdIncludes
            + this.engineIncludes
            + "namespace "
            + ["Soms", somsPackage.name].join(".").replace(/\./g, "::")
            + " {\n";

        this.transpileEnums(somsPackage);
        this.transpileClasses(somsPackage);
        this.transpilationBuffer += "};\n";

        return {
            source : this.transpilationBuffer,
            filename : somsPackage.name + ".hpp"
        }
    }

    private padString(str : string, width : number) : string {
        // return str.padStart(str.length+width);
        return " ".repeat(width) + str;
    }

    private transpileEnums(somsPackage : SomsPackage) : void {
        for (let somsEnum of somsPackage.enums) {
            this.UDTs.set(somsEnum.name, "enum");

            let indexedStringArray : string = this.padString(`\nstatic std::string ${somsEnum.name}StrArray[] = {"",`, this.TAB);
            this.transpilationBuffer += this.padString(`\n\nenum ${somsEnum.name} {${somsEnum.name}NONE,`, this.TAB);

            for (let i = 0; i < somsEnum.values.length; i++) {
                this.transpilationBuffer += (i + 1 >= somsEnum.values.length) ? `${somsEnum.name}_${somsEnum.values[i]}};\n` : `${somsEnum.name}_${somsEnum.values[i]},`;
                indexedStringArray       += (i + 1 >= somsEnum.values.length) ? `"${somsEnum.name}_${somsEnum.values[i]}"};\n` : `"${somsEnum.name}_${somsEnum.values[i]}",`;
            }

            //this string array will be placed in class definitions where the relevant enum type is referenced
            this.transpilationBuffer += indexedStringArray;
        }
    }

    private resolveDimensionality(resolvedType : string, dimensionality : number) : string {
        let resolvedTypeDimensionality : string = "";
        switch (dimensionality) {
            case 0:
                resolvedTypeDimensionality = `${resolvedType}`;
                break;
            case 1:
                resolvedTypeDimensionality = `std::vector<${resolvedType}>`;
                break;
            case 2:
                resolvedTypeDimensionality = `std::vector<std::vector<${resolvedType}>>`;
                break;
            case 3:
                resolvedTypeDimensionality = `std::vector<std::vector<std::vector<${resolvedType}>>>`;
                break;

        }
        return resolvedTypeDimensionality;
    }

    private transpileClasses(somsPackage : SomsPackage) : void {
        for (let somsClass of somsPackage.classes) {

            this.UDTs.set(somsClass.name, "class");
            this.transpilationBuffer += this.padString(`class ${somsClass.name} {\n    public:\n`, this.TAB);

            for (let somsField of somsClass.fields) {

                let resolvedType : string = this.resolveType(somsField.typeIdentifier.name);

                //getters/setters
                this.transpilationBuffer += this.padString(`const ${this.resolveDimensionality(resolvedType, somsField.dimensionality)} get${somsField.name}() const {\n`, this.TAB*2);
                this.transpilationBuffer += this.padString(`return this->${somsField.name}.${somsField.name};\n`, this.TAB*3);
                this.transpilationBuffer += this.padString(`};\n\n`, this.TAB*2);


                if (!somsField.staticConst) {
                    this.transpilationBuffer += this.padString(`void set${somsField.name}(${this.resolveDimensionality(resolvedType, somsField.dimensionality)} value) {\n`, this.TAB*2);
                    this.transpilationBuffer += this.padString(`this->${somsField.name}.${somsField.name} = value;\n`, this.TAB*3);
                    this.transpilationBuffer += this.padString(`};\n`, this.TAB*2);
                }
            }

            this.transpilationBuffer += this.padString("private:\n", this.TAB);
            for (let somsField of somsClass.fields) {

                let resolvedType              = this.resolveType(somsField.typeIdentifier.name);
                let fieldDefinition  : string = "";
                this.transpilationBuffer     += this.padString(`struct Field${somsField.name} {\n`, this.TAB*2);


                if (somsField.staticConst) {
                    fieldDefinition  += ""; //TO BE IMPLEMENTED, const causes encapsulating containers, i.e. vector operator= to be deleted. Maybe a copy constructor for field struct type?
                }
                fieldDefinition += `${this.resolveDimensionality(resolvedType, somsField.dimensionality)} `;

                if (somsField.name) fieldDefinition         += `${somsField.name}`;
                if (somsField.staticConst) {

                    if (somsField.dimensionality == 0) {

                        if (this.UDTs.get(resolvedType) != "enum") {
                            fieldDefinition += (resolvedType == "std::string")
                                                        ? ` = "${somsField.staticConstValue}"`
                                                        : ` = ${somsField.staticConstValue}`;
                        }
                    }
                }

                if (this.UDTs.get(somsField.typeIdentifier.name) == "enum") {
                    fieldDefinition += (somsField.dimensionality == 0) ? `= ${somsField.typeIdentifier.name}(0)` : `= {}`;
                }

                fieldDefinition += ";\n";
                this.transpilationBuffer += this.padString(fieldDefinition, this.TAB*3);

                this.transpilationBuffer += this.padString(`bool optional = ${somsField.optional};\n`, this.TAB*3);
                this.transpilationBuffer += this.padString(`} ${somsField.name};\n`,                   this.TAB*2);
            }
            this.transpilationBuffer += this.padString(`bool bToJson = false;\n`, this.TAB*2);
            this.transpilationBuffer += this.padString("public:\n", this.TAB);

            this.transpilationBuffer += this.buildClassSerdeMethods(somsClass.name, somsClass.name, somsClass.fields);
            this.transpilationBuffer += this.padString("};\n\n", this.TAB);
        }
    }

    private mapEnumValueToString(field : SomsField, fieldIdentifier : string, tabSize : number, arrName : string, index : string) : string {
        let serializeMethod : string = "";

        serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}enumIndex = 0;\n`, tabSize)
        serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}length = sizeof(${fieldIdentifier}StrArray) / sizeof(std::string);\n`, tabSize);
        serializeMethod +=     this.padString(`for (int j = 0; j < ${fieldIdentifier}length; j++) {\n`, tabSize);
        serializeMethod +=     this.padString(`if (${arrName}[j].find(${index}, 0) != std::string::npos) {\n`,  tabSize + this.TAB);
        serializeMethod +=     this.padString(`${fieldIdentifier}enumIndex = j;\n`,tabSize + this.TAB*2);
        serializeMethod +=     this.padString(`break;\n`, tabSize + this.TAB*2);
        serializeMethod +=     this.padString(`}\n`, tabSize + this.TAB);
        serializeMethod +=     this.padString(`}\n`, tabSize);

        return serializeMethod;
    }

    private buildClassSerdeMethods(name: string, type : string, fields : Array<SomsField>) : string {

        let serializeMethod      = this.padString(`void Serialize(JsonSerializer& s) {\n`, this.TAB*2);
        fields.forEach(field => {
            let fieldIdentifier : string = field.typeIdentifier.name;

            if (this.primitiveMap.has(fieldIdentifier) || (this.UDTs.has(fieldIdentifier) && this.UDTs.get(fieldIdentifier) != "enum")) {
                serializeMethod +=     this.padString(`s.Serialize("${field.name}", ${field.name}.${field.name});\n`, this.TAB*3);
            }
            else {
                serializeMethod +=     this.padString(`if (this->bToJson) {\n`, this.TAB*3);

                let tabSize = this.TAB * 4;
                if (field.dimensionality > 0) {
                    tabSize = this.TAB * 5
                    serializeMethod += this.padString(`std::vector<std::string> enumValues;\n`, this.TAB*4);
                    serializeMethod += this.padString(`for (int i = 0; i < ${field.name}.${field.name}.size(); i++) {\n`, this.TAB*4);
                }
                
                serializeMethod += this.mapEnumValueToString(field, fieldIdentifier, tabSize, `${fieldIdentifier}StrArray`, (field.dimensionality==0) ? `${fieldIdentifier}StrArray[${field.name}.${field.name}]` : `${fieldIdentifier}StrArray[${field.name}.${field.name}[j]]`);
                if (field.dimensionality > 0) {
                    serializeMethod += this.padString(`enumValues.push_back(${fieldIdentifier}StrArray[${field.typeIdentifier.name}enumIndex]);\n`, tabSize);
                    serializeMethod += this.padString(`}\n`, this.TAB*4);
                }

                serializeMethod += (field.dimensionality == 0) ? 
                                   this.padString(`s.Serialize("${field.name}",${fieldIdentifier}StrArray[${field.name}.${field.name}]);\n`, tabSize) :                              
                                   this.padString(`s.Serialize("${field.name}.${field.name}", enumValues);\n`, tabSize);

                serializeMethod +=     this.padString(`}\n`, this.TAB*3);
                serializeMethod +=     this.padString(`else {\n`, this.TAB*3);

                if (field.dimensionality > 0) {
                    serializeMethod +=     this.padString(`std::vector<std::string> enumValues;\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`s.Serialize("${field.name}", enumValues);\n`, this.TAB*4);
                    serializeMethod += this.padString(`for (int i = 0; i < enumValues.size(); i++) {\n`, this.TAB*4);
                }
                else {

                    serializeMethod +=     this.padString(`std::string enumValue;\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`s.Serialize("${field.name}", enumValue);\n`, this.TAB*4);
                }
                

                serializeMethod += this.mapEnumValueToString(field, fieldIdentifier, tabSize, `${fieldIdentifier}StrArray`, (field.dimensionality==0) ? `enumValue` : `enumValues[i]`);
                serializeMethod +=  (field.dimensionality == 0) ? 
                                    this.padString(`${field.name}.${field.name} = ${fieldIdentifier}(${fieldIdentifier}enumIndex);\n`, this.TAB*4) :
                                    this.padString(`${field.name}.${field.name}.push_back(${fieldIdentifier}(${fieldIdentifier}enumIndex));\n`, this.TAB*4);

                if (field.dimensionality > 0) serializeMethod += this.padString(`}\n`, this.TAB*3);
                serializeMethod +=     this.padString(`}\n`, this.TAB*3);
            }
        });
        serializeMethod         += this.padString(`};\n\n`, this.TAB*2);

        let serdeMethodFromJson  = this.padString(`bool fromJson(const char* json) {\n`, this.TAB*2);
        serdeMethodFromJson     += this.padString(`Json::Value  root;\n\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`Json::Reader reader;\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`if (!reader.parse(json, root)) {}\n\n`, this.TAB*3);

        fields.forEach(field => {
            serdeMethodFromJson += this.padString(`if (!root.isMember("${field.name}")) {\n`, this.TAB*3);
            serdeMethodFromJson += this.padString(`if (!this->${field.name}.optional) {\n`, this.TAB*4);
            serdeMethodFromJson += this.padString(`return false;\n`, this.TAB*5);
            serdeMethodFromJson += this.padString(`}\n`, this.TAB*4);
            serdeMethodFromJson += this.padString(`}\n`, this.TAB*3);
        });

        serdeMethodFromJson     += this.padString(`this->bToJson = false;\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`JsonSerializer s(false);\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`s.JsonValue = root;\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`this->Serialize(s);\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`return true;\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`};\n\n`, this.TAB*2);


        let serdeMethodToJson   =  this.padString(`Json::Value toJson() {\n`, this.TAB*2);
        serdeMethodToJson      +=  this.padString(`JsonSerializer s(true);\n`, this.TAB*3);
        serdeMethodToJson      +=  this.padString(`this->bToJson = true;\n`, this.TAB*3);
        fields.forEach(field => {
            let fieldIdentifier : string = field.typeIdentifier.name;

            if (this.primitiveMap.has(fieldIdentifier) || (this.UDTs.has(fieldIdentifier) && this.UDTs.get(fieldIdentifier) != "enum")) {
                serdeMethodToJson +=     this.padString(`s.Serialize("${field.name}", ${field.name}.${field.name});\n`, this.TAB*3);
            }
            else {
                if (field.dimensionality == 0) {                    
                    serdeMethodToJson += this.padString(`s.Serialize("${field.name}", ${field.typeIdentifier.name}StrArray[${field.name}.${field.name}]);\n`, this.TAB*3);
                }
                else {

                    serdeMethodToJson += this.padString(`std::vector<std::string> enumStrings;\n`, this.TAB*3);
                    serdeMethodToJson += this.padString(`for (int i = 0; i < ${field.name}.${field.name}.size(); i++) {`, this.TAB*3);
                    serdeMethodToJson += this.padString(`enumStrings.push_back(${field.typeIdentifier.name}StrArray[${field.name}.${field.name}[i]]);`, this.TAB*4);
                    serdeMethodToJson += this.padString(`}`, this.TAB*3);

                    serdeMethodToJson += this.padString(`s.Serialize("${field.name}", enumStrings);\n`, this.TAB*3);
                }                 
            }
        });
        serdeMethodToJson      +=  this.padString(`return s.JsonValue;\n`, this.TAB*3);
        serdeMethodToJson      +=  this.padString(`}\n`, this.TAB*2);

        return serializeMethod + serdeMethodFromJson + serdeMethodToJson;
    }

    private resolveType(typeIdentifier : string) : string {
        let resolvedType : string = "";
        let mapValue              = this.primitiveMap.get(typeIdentifier);

        if (mapValue == undefined) {
            if (this.UDTs.get(typeIdentifier) == undefined) {
                let error : string = `Undefined type ${typeIdentifier}\n`;
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
    }
}