import {symlink} from "fs";


export type SomsPrimitiveType = "boolean" | "int64" | "double" | "string";

export type SomsType<TypeContainer, T extends keyof TypeContainer>
    = SomsPrimitiveType | SomsEnum | SomsUdt<TypeContainer, T> | T;

export interface SomsEnum {
    readonly name: string;
    readonly values: string[];
}

export class ConcreteSomsEnum implements SomsEnum {
    readonly name: string;
    readonly values: string[];

    public static create(e: SomsEnum) : SomsEnum {
        return new ConcreteSomsEnum(e);
    }

    protected constructor(e: SomsEnum) {
        this.name = e.name;
        this.values = e.values;
    }
}


export interface SomsConstant<TypeContainer, T extends keyof TypeContainer> {
    readonly name: string;
    readonly value: SomsType<TypeContainer, T> | SomsType<TypeContainer, T>[] | null;
}

export class ConcreteSomsConstant<TypeContainer, T extends keyof TypeContainer>
    implements SomsConstant<TypeContainer, T>
{
    readonly name: string;
    readonly value: SomsType<TypeContainer, T> | SomsType<TypeContainer, T>[] | null;

    public static create<TypeContainer, T extends keyof TypeContainer>
    (c: SomsConstant<TypeContainer, T>) : SomsConstant<TypeContainer, T>
    {
        return new ConcreteSomsConstant(c);
    }

    protected constructor(c: SomsConstant<TypeContainer, T>) {
        this.name = c.name;
        this.value = c.value;
    }
}


export interface WeakSomsField<TypeContainer, T extends keyof TypeContainer> {
    readonly name: string;
    readonly position?: number;
    readonly optional?: boolean;
    readonly defaultValue?: SomsType<TypeContainer, T> | SomsType<TypeContainer, T>[] | null;
}

export interface SomsField<TypeContainer, T extends keyof TypeContainer> extends WeakSomsField<TypeContainer, T> {
    readonly name: string;
    readonly position: number;
    readonly optional: boolean;
    readonly defaultValue: SomsType<TypeContainer, T> | SomsType<TypeContainer, T>[] | null;
}

export interface WeakSomsSupplement<TypeContainer, T extends keyof TypeContainer> {
    w: WeakSomsField<TypeContainer, T>;
    defaults: SomsField<TypeContainer, T>;
}

export class ConcreteSomsField<TypeContainer, T extends keyof TypeContainer>
    implements SomsField<TypeContainer, T>
{
    readonly name: string;
    readonly position: number;
    readonly optional: boolean;
    readonly defaultValue: SomsType<TypeContainer, T> | SomsType<TypeContainer, T>[] | null;

    public static create<TypeContainer, T extends keyof TypeContainer>
    (f : WeakSomsSupplement<TypeContainer, T> | SomsField<TypeContainer, T>)
        : SomsField<TypeContainer, T>
    {
        return this.isSomsField(f)
        ? new ConcreteSomsField(f)
            : new ConcreteSomsField(
            {
                name: f.w.name,
                position: f.w.position ? f.w.position : f.defaults.position,
                optional: f.w.optional ? f.w.optional : f.defaults.optional,
                defaultValue: f.w.defaultValue ? f.w.defaultValue : f.defaults.defaultValue
            }
        );
    }

    protected static isSomsField<TypeContainer, T extends keyof TypeContainer>
    (f: WeakSomsSupplement<TypeContainer, T> | SomsField<TypeContainer, T>)
        : f is SomsField<TypeContainer, T>
    {
        return 'name' in f
            && 'position' in f
            && 'optional' in f
            && 'defaultValue' in f;
    }

    protected constructor(f: SomsField<TypeContainer, T>)
    {
        this.name = f.name;
        this.position = f.position;
        this.optional = f.optional;
        this.defaultValue = f.defaultValue;
    }
}


export interface SomsUdt<TypeContainer, T extends keyof TypeContainer> {
    readonly name: string,
    readonly constants: SomsConstant<TypeContainer, T>[],
    readonly fields: SomsField<TypeContainer, T>[]
}

export class ConcreteSomsUdt<TypeContainer, T extends keyof TypeContainer>
    implements SomsUdt<TypeContainer, T>
{
    readonly name: string;
    readonly constants: SomsConstant<TypeContainer, T>[];
    readonly fields: SomsField<TypeContainer, T>[];

    static create<TypeContainer, T extends keyof TypeContainer>
    (u: SomsUdt<TypeContainer, T>) : SomsUdt<TypeContainer, T>
    {
        return new ConcreteSomsUdt(u);
    }

    protected constructor(u: SomsUdt<TypeContainer, T>)
    {
        this.name = u.name;
        this.constants = u.constants;
        this.fields = u.fields;
    }
}


export interface SomsPackage<TypeContainer, T extends keyof TypeContainer> {
    readonly name: string;
    readonly constants: SomsConstant<TypeContainer, T>[],
    readonly udts: SomsUdt<TypeContainer, T>[]
}

export class ConcreteSomsPackage<TypeContainer, T extends keyof TypeContainer>
    implements SomsPackage<TypeContainer, T>
{
    readonly name: string;
    readonly constants: SomsConstant<TypeContainer, T>[];
    readonly udts: SomsUdt<TypeContainer, T>[];

    static create<TypeContainer, T extends keyof TypeContainer>
    (p: SomsPackage<TypeContainer, T>) : SomsPackage<TypeContainer, T>
    {
        return new ConcreteSomsPackage(p);
    }

    protected constructor(p: SomsPackage<TypeContainer, T>)
    {
        this.name = p.name;
        this.constants = p.constants;
        this.udts = p.udts;
    }
}


export interface SomsSpecification<TypeContainer, T extends keyof TypeContainer> {
    readonly packages: SomsPackage<TypeContainer, T>[];
}

export class ConcreteSomsSpecification<TypeContainer, T extends keyof TypeContainer>
    implements SomsSpecification<TypeContainer, T>
{
    readonly packages: SomsPackage<TypeContainer, T>[];

    static create<TypeContainer, T extends keyof TypeContainer>
    (s: SomsSpecification<TypeContainer, T>)
    {
        return new ConcreteSomsSpecification(s);
    }

    protected constructor(s: SomsSpecification<TypeContainer, T>) {
        this.packages = s.packages.map(p => ConcreteSomsPackage.create(p));
    }
}
