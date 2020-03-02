import {SomsPackage} from "./somstree";


export interface SomsGeneratorOptions {
}

export interface SomsGenerator {
    generate(packages: SomsPackage[], options?: SomsGeneratorOptions) : FileSource[];
}

export interface Source {
    readonly source: string;
}

export interface PackageSource extends Source {
    readonly source: string;
    readonly packageName: string;
}

export interface FileSource extends Source {
    readonly source: string;
    readonly filename: string;
}
