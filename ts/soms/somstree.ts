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

import {SomsPackagePath} from "./somsgenerator";

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

export type SomsPackageAliasName = string;
// export type SomsPackageName = string;

export type SomsPackageMemberAliasName = string;
export type SomsPackageMemberName = string;
export type SomsPackageMemberAddress = {packagePath: SomsPackagePath, packageMemberName: SomsPackageMemberName};

export class SomsPackage implements SomsTreeNode {
    readonly somsNodeType = SomsNodeType.SOMSPACKAGE;

    readonly path: string[];
    readonly name: string;
    readonly enums: SomsEnum[];
    readonly classes: SomsClass[];
    readonly packageImportAliases: Record<SomsPackageAliasName, SomsPackagePath>;
    readonly packageMemberImportAliases: Record<SomsPackageMemberAliasName, SomsPackageMemberAddress>;

    constructor(p: SomsPackageLite) {
        this.path = p.path;
        this.name = p.name ? p.name : this.path.join(".");
        this.enums = p.enums ? p.enums : [];
        this.classes = p.classes ? p.classes : [];
        this.packageImportAliases = p.packageImportAliases ? p.packageImportAliases : {};
        this.packageMemberImportAliases = p.packageMemberImportAliases ? p.packageMemberImportAliases : {};
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
    readonly path: string[];
    readonly name?: string;
    readonly enums?: SomsEnum[];
    readonly classes?: SomsClass[];
    readonly packageImportAliases?: Record<SomsPackageAliasName, SomsPackagePath>;
    readonly packageMemberImportAliases?: Record<SomsPackageMemberAliasName, SomsPackageMemberAddress>;
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
