export declare type SomsPrimitiveType = "boolean" | "int64" | "double" | "string";
export declare type SomsType<TypeContainer, T extends keyof TypeContainer> = SomsPrimitiveType | SomsEnum | SomsUdt<TypeContainer, T> | T;
export interface SomsEnum {
    name: string;
    values: Array<string>;
}
export interface SomsConstant<TypeContainer, T extends keyof TypeContainer> {
    name: string;
    value: SomsType<TypeContainer, T> | Array<SomsType<TypeContainer, T>> | null;
}
export interface SomsField<TypeContainer, T extends keyof TypeContainer> {
    name: string;
    position: number;
    optional: boolean;
    defaultValue: SomsType<TypeContainer, T> | Array<SomsType<TypeContainer, T>> | null;
}
export interface SomsUdt<TypeContainer, T extends keyof TypeContainer> {
    name: string;
    constants: Array<SomsConstant<TypeContainer, T>>;
    fields: Array<SomsField<TypeContainer, T>>;
}
export interface SomsPackage<TypeContainer, T extends keyof TypeContainer> {
    name: string;
    constants: Array<SomsConstant<TypeContainer, T>>;
    udts: Array<SomsUdt<TypeContainer, T>>;
}
export interface SomsSpecification<TypeContainer, T extends keyof TypeContainer> {
    packages: Array<SomsPackage<TypeContainer, T>>;
}
