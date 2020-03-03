export enum SomsNodeType {
    SOMSENUM = "SOMSENUM",
    SOMSFIELD = "SOMSFIELD",
    SOMSCLASS = "SOMSCLASS",
    SOMSPACKAGE = "SOMSPACKAGE"
}

export enum SomsUdtType {
    SOMSENUM = "SOMSENUM",
    SOMSCLASS = "SOMSCLASS"
}

export interface SomsTreeNode {
    readonly somsNodeType: SomsNodeType;
    readonly name: string;
}

export class SomsEnum implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSENUM;

    readonly name: string;
    readonly values: string[];

    constructor(e: SomsEnumLite) {
        this.name = e.name;
        this.values = e.values;
    }
}

export class SomsField implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSFIELD;

    readonly name: string;
    readonly typeIdentifier: SomsTypeIdentifier;
    readonly udtType: SomsUdtType | null;
    readonly dimensionality: number;
    readonly optional: boolean;
    readonly staticConst: boolean;
    readonly staticConstValue: SomsValue | null;

    constructor(f: SomsFieldLite) {
        this.name = f.name;
        this.typeIdentifier = f.typeIdentifier;
        this.udtType = f.udtType ? f.udtType : null;
        this.dimensionality = f.dimensionality ? f.dimensionality : 0;
        this.optional = f.optional ? f.optional : false;
        this.staticConst = f.staticConst ? f.staticConst : false;

        this.staticConstValue = (
            "staticConstValue" in f
            && f.staticConstValue !== null
            && f.staticConstValue !== undefined
        )
            ? f.staticConstValue
            : null;
    }
}

export class SomsClass implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSCLASS;

    readonly name: string;
    readonly fields: SomsField[];

    constructor(c: SomsClassLite) {
        this.name = c.name;
        this.fields = c.fields ? c.fields : [];
    }
}

export class SomsPackage implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSPACKAGE;

    readonly name: string;
    readonly enums: SomsEnum[];
    readonly classes: SomsClass[];

    constructor(p: SomsPackageLite) {
        this.name = p.name;
        this.enums = p.enums ? p.enums : [];
        this.classes = p.classes ? p.classes : [];
    }
}


export interface SomsEnumLite {
    readonly name: string;
    readonly values: string[];
}

export interface SomsFieldLite {
    readonly name: string;
    readonly typeIdentifier: SomsTypeIdentifier;
    readonly udtType?: SomsUdtType | null;
    readonly dimensionality?: number;
    readonly optional?: boolean;
    readonly staticConst?: boolean;
    readonly staticConstValue?: SomsValue | null;
}

export interface SomsClassLite {
    readonly name: string;
    readonly fields?: SomsField[];
}

export interface SomsPackageLite {
    readonly name: string;
    readonly enums?: SomsEnum[];
    readonly classes?: SomsClass[];
}


export type SomsNumberType = "int64" | "double";
export type SomsPrimitiveType = SomsNumberType | "boolean" | "string";

const SomsNumberTypeList : any = {
    int64: 0,
    double: 1
};

const SomsPrimitiveTypeList : any = {
    boolean: 0,
    int64: 1,
    double: 2,
    string: 3
};

export function isSomsNumberType(t: SomsTypeIdentifier | string)
    : t is SomsNumberType
{
    return t in SomsNumberTypeList;
}

export function isSomsPrimitiveType(t: SomsTypeIdentifier | string)
    : t is SomsPrimitiveType
{
    return t in SomsPrimitiveTypeList;
}

export function isSomsEnumOrClassIdentifier(t: SomsTypeIdentifier)
    : t is SomsEnumOrClassIdentifier
{
    return t && !isSomsPrimitiveType(t) && "name" in t;
}

export interface SomsEnumOrClassIdentifier {
    readonly name: string;
}

export type SomsTypeIdentifier = SomsPrimitiveType | SomsEnumOrClassIdentifier;

export interface SomsEnumValueReference {
    readonly enumName: string;
    readonly value: string;
}

export type SomsPrimitiveValue = boolean | number | string;
export type SomsValue = SomsPrimitiveValue | SomsEnumValueReference;
