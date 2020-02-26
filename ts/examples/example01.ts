import {int64, double} from "./somstypes";


export enum FooType {
    FOO = "FOO",
    BAR = "BAR",
    BAZ = "BAZ"
}

export class FooBurglar {
    static readonly DEFAULT_FOO_TYPE = FooType.BAR;

    name: string;
    yearOfBirth: int64;
    fooType: FooType;
    heightInKm: double;
    aliases: string[];
}
