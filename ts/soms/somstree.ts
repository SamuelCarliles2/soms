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

    constructor(e: SomsEnumLite) {
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

    constructor(f: SomsFieldLite) {
        this.name = f.name;
        this.typeIdentifier = f.typeIdentifier;
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


export class SomsTypeIdentifier {
    constructor(readonly name: string) {}
}

export class SomsPrimitiveType extends SomsTypeIdentifier {
    constructor(readonly name: string) { super(name); }
}

export class SomsNumberType extends SomsPrimitiveType {
    constructor(readonly name: string) { super(name); }
}

export class SomsInt64TypeIdentifier extends SomsNumberType {
    constructor() { super("int64"); }
}

export class SomsDoubleTypeIdentifier extends SomsNumberType {
    constructor() { super("double"); }
}

export class SomsBooleanTypeIdentifier extends SomsPrimitiveType {
    constructor() { super("boolean"); }
}

export class SomsStringTypeIdentifier extends SomsPrimitiveType {
    constructor() { super("string"); }
}

export class SomsUserDefinedTypeIdentifier extends SomsTypeIdentifier {
    constructor(readonly name: string) { super(name); }
}

export class SomsEnumTypeIdentifier extends SomsUserDefinedTypeIdentifier {
    constructor(readonly name: string) { super(name); }
}

export class SomsClassTypeIdentifier extends SomsUserDefinedTypeIdentifier {
    constructor(readonly name: string) { super(name); }
}

const SomsPrimitiveTypeList : any = {
    boolean: 0,
    int64: 1,
    double: 2,
    string: 3
};

export function isSomsPrimitiveType(t: SomsTypeIdentifier | string)
    : t is SomsPrimitiveType
{
    return t instanceof SomsPrimitiveType || t in SomsPrimitiveTypeList;
}

export interface SomsEnumValueReference {
    readonly enumName: string;
    readonly value: string;
}

export type SomsPrimitiveValue = boolean | number | string;
export type SomsValue = SomsPrimitiveValue | SomsEnumValueReference;
