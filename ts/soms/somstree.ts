export type SomsTypeIdentifier = string;

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
    readonly optional: boolean;
    readonly staticConst: boolean;
    readonly staticConstValue: any;
    readonly position: number | null;

    constructor(f: WeakSomsField) {
        this.name = f.name;
        this.typeIdentifier = f.typeIdentifier;
        this.optional = f.optional ? f.optional : false;
        this.staticConst = f.staticConst ? f.staticConst : false;
        this.staticConstValue = f.staticConstValue ? f.staticConstValue : null;
        this.position = f.position ? f.position : null;
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
    readonly optional?: boolean;
    readonly staticConst?: boolean;
    readonly staticConstValue?: any;
    readonly position?: number;
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
