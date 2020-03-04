import {FileSource, SomsGenerator, SomsGeneratorOptions} from "../somsgenerator";
import { SomsPackage, SomsEnum, SomsTypeIdentifier, SomsEnumOrClassIdentifier, SomsPrimitiveType, SomsField } from "../somstree";


export class CppTranspiler implements SomsGenerator {
    private primitiveMap : Map<string, string> = new Map([
        ["string",  "std::string"],
        ["int64",   "int64_t"],
        ["boolean", "bool"],
        ["double",  "double"],
    ]);
    

    private UDTs : Map<string, string> = new Map();

    private transpilationBuffer     : string = "";
    private fileName                : string = "";

    private readonly stdIncludes    : string = "#include <string>\n#include <vector>\n#include <algorithm>\n#include <iterator>\n";
    private readonly engineIncludes : string = "#include <KataCore/JsonSerializer.h>\n#include <json/reader.h>\n\nnamespace Soms {\n";

    private readonly TAB            : number = 4;

    public generate(somspackages : Array<SomsPackage>) : FileSource[] {
        return somspackages.map(p => this.generateSource(p));
    }

    private generateSource(somsPackage : SomsPackage) : FileSource {
        this.transpilationBuffer = this.stdIncludes + this.engineIncludes;

        this.transpileEnums(somsPackage);
        this.transpileClasses(somsPackage);
        this.transpilationBuffer += "};\n";

        return {
            source : this.transpilationBuffer,
            filename : somsPackage.name + ".cpp"
        }
    }

    private padString(str : string, width : number) : string {
        return str.padStart(str.length+width);
    }

    private transpileEnums(somsPackage : SomsPackage) : void {
        for (let somsEnum of somsPackage.enums) {
            this.UDTs.set(somsEnum.name, "enum");

            let indexedStringArray : string = this.padString(`\nstd::string ${somsEnum.name}StrArray[] = {"",`, this.TAB);
            this.transpilationBuffer += this.padString(`\n\nenum ${somsEnum.name} {${somsEnum.name}NONE,`, this.TAB);
            for (let i = 0; i < somsEnum.values.length; i++) {
                this.transpilationBuffer += (i + 1 >= somsEnum.values.length) ? `${somsEnum.values[i]}};\n` : `${somsEnum.values[i]},`;
                indexedStringArray       += (i + 1 >= somsEnum.values.length) ? `"${somsEnum.values[i]}"};\n` : `"${somsEnum.values[i]}",`;
            }
            this.transpilationBuffer += indexedStringArray;
        }
    }

    private retrieveTypeName(typeIdentifier : any) : string {
        return ("name" in typeIdentifier) ? typeIdentifier.name : typeIdentifier;
    }

    private transpileClasses(somsPackage : SomsPackage) : void {
        for (let somsClass of somsPackage.classes) {
        
            this.UDTs.set(somsClass.name, "class");
            this.transpilationBuffer += this.padString(`class ${somsClass.name} {\n    public:\n`, this.TAB);

            for (let somsField of somsClass.fields) {

                let resolvedType : string = this.resolveType(this.retrieveTypeName(somsField.typeIdentifier));

                //getters/setters
                switch (somsField.dimensionality) {
                    case 0:
                        this.transpilationBuffer += this.padString(`const ${resolvedType} get${somsField.name}() const {\n`, this.TAB*2);
                        break;
                    case 1:
                        this.transpilationBuffer += this.padString(`const std::vector<${resolvedType}> get${somsField.name}() const {\n`, this.TAB*2);
                        break;
                }

                this.transpilationBuffer += this.padString(`return this->${somsField.name}.${somsField.name};\n`, this.TAB*3);
                this.transpilationBuffer += this.padString(`};\n\n`, this.TAB*2);
                
                
                if (!somsField.staticConstValue) {
                    switch (somsField.dimensionality) {
                    case 0:
                        this.transpilationBuffer += this.padString(`void set${somsField.name}(${resolvedType} value) {\n`, this.TAB*2);
                        break;
                    case 1:
                        this.transpilationBuffer += this.padString(`void set${somsField.name}(std::vector<${resolvedType}> value) {\n`, this.TAB*2);
                        break;
                    }
                    this.transpilationBuffer += this.padString(`this->${somsField.name}.${somsField.name} = value;\n`, this.TAB*3);
                    this.transpilationBuffer += this.padString(`};\n`, this.TAB*2);
                }
            }

            this.transpilationBuffer += this.padString("private:\n", this.TAB);
            for (let somsField of somsClass.fields) {

                let resolvedType             = this.resolveType(this.retrieveTypeName(somsField.typeIdentifier));
                let fieldDefinition : string = "";
                this.transpilationBuffer    += this.padString(`struct Field${somsField.name} {\n`, this.TAB*2);
                

                if (somsField.staticConstValue) {
                    fieldDefinition  += "static const ";
                }

                switch (somsField.dimensionality) {
                    case 0:
                        fieldDefinition += `${resolvedType} `;
                        break;
                    case 1:
                        fieldDefinition += `std::vector<${resolvedType}> `;
                        break;
                    case 2:
                        fieldDefinition += `std::vector<std::vector<${resolvedType}>> `;
                        break;
                    case 3:
                        fieldDefinition += `std::vector<std::vector<std::vector<${resolvedType}>>> `;
                        break;
                }
                
                if (somsField.name) fieldDefinition         += `${somsField.name}`;
                /*
                if (somsField.defaultValue) {

                    if (somsField.dimensionality == 0) {
                        fieldDefinition += (resolvedType == "std::string") 
                                                    ? ` = "${somsField.defaultValue}"` 
                                                    : ` = ${somsField.defaultValue}`;
                    }
                }*/
                if (this.UDTs.get(this.retrieveTypeName(somsField.typeIdentifier)) == "enum") {
                    fieldDefinition += `= ${somsField.typeIdentifier}(0)`;
                }

                fieldDefinition += ";\n";
                this.transpilationBuffer += this.padString(fieldDefinition, this.TAB*3);

                this.transpilationBuffer += this.padString(`bool optional = ${somsField.optional};\n`,                      this.TAB*3);
                this.transpilationBuffer += this.padString(`int dimensionality = ${somsField.dimensionality};\n`,           this.TAB*3);
                this.transpilationBuffer += this.padString(`std::string typeIdentifier = "${this.retrieveTypeName(somsField.typeIdentifier)}";\n`, this.TAB*3);
                this.transpilationBuffer += this.padString(`bool staticConstValue = ${somsField.staticConstValue};\n`,      this.TAB*3);
                this.transpilationBuffer += this.padString(`} ${somsField.name};\n\n`,                                      this.TAB*2);
            }
            this.transpilationBuffer += this.padString(`bool bToJson = false;\n`, this.TAB*2);
            this.transpilationBuffer += this.padString("public:\n", this.TAB);

            this.transpilationBuffer += this.buildClassSerdeMethods(somsClass.name, somsClass.name, somsClass.fields);
            this.transpilationBuffer += this.padString("};\n\n", this.TAB);
        }
    }

    private buildClassSerdeMethods(name: string, type : string, fields : Array<SomsField>) : string {

        let serializeMethod      = this.padString(`void Serialize(JsonSerializer& s) {\n`, this.TAB*2);
        fields.forEach(field => {
            let fieldIdentifier : string = this.retrieveTypeName(field.typeIdentifier);

            if (!field.staticConstValue) {
                if (this.primitiveMap.has(fieldIdentifier) || (this.UDTs.has(fieldIdentifier) && this.UDTs.get(fieldIdentifier) != "enum")) {
                    serializeMethod +=     this.padString(`s.Serialize("${field.name}", ${field.name}.${field.name});\n`, this.TAB*3);
                }
                else {
                    serializeMethod +=     this.padString(`if (this->bToJson) {\n`, this.TAB*3);
                    serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}enumIndex = 0;\n`, this.TAB*4)
                    serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}length = sizeof(${fieldIdentifier}StrArray) / sizeof(std::string);\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`for (int i = 0; i < ${fieldIdentifier}length; i++) {\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`if (${fieldIdentifier}StrArray[i].find(${fieldIdentifier}StrArray[${field.name}.${field.name}], 0) != std::string::npos) {\n`, this.TAB*5);
                    serializeMethod +=     this.padString(`${field.typeIdentifier}enumIndex = i;\n`, this.TAB*6);
                    serializeMethod +=     this.padString(`break;\n`, this.TAB*6);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*5);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`s.Serialize("${field.name}",${fieldIdentifier}StrArray[${field.name}.${field.name}]);\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*3);
                    serializeMethod +=     this.padString(`else {\n`, this.TAB*3);
                    serializeMethod +=     this.padString(`std::string enumValue;\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`s.Serialize("${field.name}", enumValue);\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}enumIndex = 0;\n`, this.TAB*4)
                    serializeMethod +=     this.padString(`unsigned int ${fieldIdentifier}length = sizeof(${fieldIdentifier}StrArray) / sizeof(std::string);\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`for (int i = 0; i < ${fieldIdentifier}length; i++) {\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`if (${fieldIdentifier}StrArray[i].find(enumValue, 0) != std::string::npos) {\n`, this.TAB*5);
                    serializeMethod +=     this.padString(`${fieldIdentifier}enumIndex = i;\n`, this.TAB*6);
                    serializeMethod +=     this.padString(`break;\n`, this.TAB*6);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*5);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`${field.name}.${field.name} = ${fieldIdentifier}(${fieldIdentifier}enumIndex);\n`, this.TAB*4);
                    serializeMethod +=     this.padString(`}\n`, this.TAB*3);
                }
            }
        });
        serializeMethod         += this.padString(`};\n\n`, this.TAB*2);
        
        let serdeMethodFromJson  = this.padString(`bool fromJson(const char* json) {\n`, this.TAB*2);
        serdeMethodFromJson     += this.padString(`Json::Value  root;\n\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`Json::Reader reader;\n`, this.TAB*3);
        serdeMethodFromJson     += this.padString(`if (!reader.parse(json, root)) {}\n\n`, this.TAB*3);

        fields.forEach(field => {
            if (!field.staticConstValue) {
                serdeMethodFromJson += this.padString(`if (!root.isMember("${field.name}")) {\n`, this.TAB*3);
                serdeMethodFromJson += this.padString(`if (!this->${field.name}.optional) {\n`, this.TAB*4);
                serdeMethodFromJson += this.padString(`return false;\n`, this.TAB*5);
                serdeMethodFromJson += this.padString(`}\n`, this.TAB*4);
                serdeMethodFromJson += this.padString(`}\n`, this.TAB*3);
            }
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
            let fieldIdentifier : string = this.retrieveTypeName(field.typeIdentifier);

            if (!field.staticConstValue) {
                if (this.primitiveMap.has(fieldIdentifier) || (this.UDTs.has(fieldIdentifier) && this.UDTs.get(fieldIdentifier) != "enum")) {
                    serdeMethodToJson +=     this.padString(`s.Serialize("${field.name}", ${field.name}.${field.name});\n`, this.TAB*3);
                }
                else {
                    serdeMethodToJson +=     this.padString(`s.Serialize("${field.name}", ${field.typeIdentifier}StrArray[${field.name}.${field.name}]);\n`, this.TAB*3);
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