import {symlink} from "fs";


let int64 = Symbol("int64");
let double = Symbol("double");

export type SomsPrimitiveTypeName = "boolean" | "int64" | "double" | "string";
export type SomsValueType = boolean | number | string | any | boolean[] | number[] | string[] | any[] | null;

export interface SomsEnum {
    readonly name: string;
    readonly values: string[];
}

export class ConcreteSomsEnum implements SomsEnum {
    readonly name: string;
    readonly values: string[];

    constructor(e: SomsEnum) {
        this.name = e.name;
        this.values = e.values;
    }
}


export interface SomsConstant {
    readonly name: string;
    readonly typeName: string;
    readonly value: SomsValueType;
}

export class ConcreteSomsConstant implements SomsConstant
{
    readonly name: string;
    readonly typeName: string;
    readonly value: SomsValueType;

    constructor(c: SomsConstant) {
        this.name = c.name;
        this.typeName = c.typeName;
        this.value = c.value;
    }
}


export interface WeakSomsField {
    readonly name: string;
    readonly typeName: string;
    readonly position?: number;
    readonly optional?: boolean;
    readonly defaultValue?: SomsValueType;
}

export interface SomsField extends WeakSomsField {
    readonly name: string;
    readonly typeName: string;
    readonly position: number;
    readonly optional: boolean;
    readonly defaultValue: SomsValueType;
}

export class ConcreteSomsField implements SomsField
{
    readonly name: string;
    readonly typeName: string;
    readonly position: number;
    readonly optional: boolean;
    readonly defaultValue: SomsValueType;

    constructor(f : [WeakSomsField, SomsField] | SomsField)
    {
        if(ConcreteSomsField.isSomsField(f)) {
            this.name = f.name;
            this.typeName = f.typeName;
            this.position = f.position;
            this.optional = f.optional;
            this.defaultValue = f.defaultValue;
        }
        else {
            this.name = f[0].name;
            this.typeName = f[0].typeName;
            this.position = f[0].position ? f[0].position : f[1].position;
            this.optional = f[0].optional ? f[0].optional : f[1].optional;
            this.defaultValue = f[0].defaultValue ? f[0].defaultValue : f[1].defaultValue;
        }
    }

    static isSomsField(f: [WeakSomsField, SomsField] | WeakSomsField | SomsField) : f is SomsField
    {
        return 'name' in f
            && 'typeName' in f
            && 'position' in f
            && 'optional' in f
            && 'defaultValue' in f;
    }
}


export interface WeakSomsUdt {
    readonly name: string,
    readonly constants: SomsConstant[],
    readonly fields: WeakSomsField[]
}

export interface SomsUdt {
    readonly name: string,
    readonly constants: SomsConstant[],
    readonly fields: SomsField[]
}

export class ConcreteSomsUdt implements SomsUdt
{
    readonly name: string;
    readonly constants: SomsConstant[];
    readonly fields: SomsField[];

    constructor(u: WeakSomsUdt | SomsUdt)
    {
        this.name = u.name;
        this.constants = u.constants;
        this.fields = [];
        // this.fields = u.fields;
    }
}


// export interface SomsPackage {
//     readonly name: string;
//     readonly constants: SomsConstant<TypeContainer, T>[],
//     readonly udts: SomsUdt<TypeContainer, T>[]
// }
//
// export class ConcreteSomsPackage implements SomsPackage
// {
//     readonly name: string;
//     readonly constants: SomsConstant<TypeContainer, T>[];
//     readonly udts: SomsUdt<TypeContainer, T>[];
//
//     static create(p: SomsPackage) : SomsPackage
//     {
//         return new ConcreteSomsPackage(p);
//     }
//
//     protected constructor(p: SomsPackage)
//     {
//         this.name = p.name;
//         this.constants = p.constants;
//         this.udts = p.udts;
//     }
// }
//
//
// export interface SomsSpecification {
//     readonly packages: SomsPackage[];
// }
//
// export class ConcreteSomsSpecification implements SomsSpecification
// {
//     readonly packages: SomsPackage[];
//
//     static create(s: SomsSpecification)
//     {
//         return new ConcreteSomsSpecification(s);
//     }
//
//     protected constructor(s: SomsSpecification) {
//         this.packages = s.packages.map(p => ConcreteSomsPackage.create(p));
//     }
// }
