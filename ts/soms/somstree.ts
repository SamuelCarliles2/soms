export type SomsPrimitiveType = "boolean" | "int64" | "double" | "string";

const SomsPrimitiveTypeList : any = {
    boolean: 0,
    int64: 1,
    double: 2,
    string: 3
};

export function isSomsPrimitiveType(t: SomsPrimitiveType | string) : t is SomsPrimitiveType {
    return t in SomsPrimitiveTypeList;
}

export interface SomsEnumOrClassIdentifier {
    readonly name: string;
}

export type SomsTypeIdentifier = SomsPrimitiveType | SomsEnumOrClassIdentifier;

export interface SomsEnumValueReference {
    readonly enumName: string;
    readonly value: string;
}

export type SomsValue = boolean | number | string | SomsEnumValueReference;

export enum SomsNodeType {
    SOMSENUM = "SOMSENUM",
    SOMSFIELD = "SOMSFIELD",
    SOMSCLASS = "SOMSCLASS",
    SOMSPACKAGE = "SOMSPACKAGE"
}

export interface SomsTreeNode {
    readonly somsNodeType: SomsNodeType;
    readonly name: string;
}

export class SomsEnum implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSENUM;

    readonly name: string;
    readonly values: string[];

    constructor(e: WeakSomsEnum) {
        this.name = e.name;
        this.values = e.values;
    }
}

export class SomsField implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSFIELD;

    readonly name: string;
    readonly typeIdentifier: SomsTypeIdentifier;
    readonly dimensionality: number;
    readonly optional: boolean;
    readonly staticConst: boolean;
    readonly staticConstValue: SomsValue | null;

    constructor(f: WeakSomsField) {
        this.name = f.name;
        this.typeIdentifier = f.typeIdentifier;
        this.dimensionality = f.dimensionality ? f.dimensionality : 0;
        this.optional = f.optional ? f.optional : false;
        this.staticConst = f.staticConst ? f.staticConst : false;

        this.staticConstValue = (
            "staticConstValue" in f && !(f.staticConstValue === null || f.staticConstValue === undefined)
        )
            ? f.staticConstValue
            : null;
    }
}

export class SomsClass implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSCLASS;

    readonly name: string;
    readonly fields: SomsField[];

    constructor(c: WeakSomsClass) {
        this.name = c.name;
        this.fields = c.fields ? c.fields : [];
    }
}

export class SomsPackage implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSPACKAGE;

    readonly name: string;
    readonly enums: SomsEnum[];
    readonly classes: SomsClass[];

    constructor(p: WeakSomsPackage) {
        this.name = p.name;
        this.enums = p.enums ? p.enums : [];
        this.classes = p.classes ? p.classes : [];
    }
}


export interface WeakSomsEnum {
    readonly name: string;
    readonly values: string[];
}

export interface WeakSomsField {
    readonly name: string;
    readonly typeIdentifier: SomsTypeIdentifier;
    readonly dimensionality?: number;
    readonly optional?: boolean;
    readonly staticConst?: boolean;
    readonly staticConstValue?: SomsValue;
}

export interface WeakSomsClass {
    readonly name: string;
    readonly fields?: SomsField[];
}

export interface WeakSomsPackage {
    readonly name: string;
    readonly enums?: SomsEnum[];
    readonly classes?: SomsClass[];
}
