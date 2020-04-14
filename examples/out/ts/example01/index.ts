export enum FooglarType {
    ART = "ART",
    CAT = "CAT",
    JEWEL = "JEWEL"
}

export const FooglarTypeMap : any = {
    ART: FooglarType.ART,
    CAT: FooglarType.CAT,
    JEWEL: FooglarType.JEWEL
};

export interface FooglarLite {
    readonly MESSAGE_SCHEMA_VERSION: string;

    name: string;
    yearOfBirth?: number | null;
    fooglarType: FooglarType;
    heightInKm: number;
    aliases: string[];
    aliasAliases: string[][];
    threedeeDouble: number[][][];
    intsAPoppin: number[][][];
}

export class Fooglar implements FooglarLite {
    readonly MESSAGE_SCHEMA_VERSION = "1.0.0";
    static readonly DEFAULT_CATCH? = false;
    static readonly DEFAULT_FOOGLAR_TYPE? = FooglarType.CAT;
    static readonly DISCOUNT_RATE? = 0.1;
    static readonly MIN_HAUL? = 100000;

    readonly name: string;
    readonly yearOfBirth?: number | null;
    readonly fooglarType: FooglarType;
    readonly heightInKm: number;
    readonly aliases: string[];
    readonly aliasAliases: string[][];
    readonly threedeeDouble: number[][][];
    readonly intsAPoppin: number[][][];

    constructor(o: FooglarLite) {
        this.name = o.name;
        this.yearOfBirth = (o.yearOfBirth === null || o.yearOfBirth === undefined) ? null : o.yearOfBirth;
        this.fooglarType = o.fooglarType;
        this.heightInKm = o.heightInKm;
        this.aliases = o.aliases;
        this.aliasAliases = o.aliasAliases;
        this.threedeeDouble = o.threedeeDouble;
        this.intsAPoppin = o.intsAPoppin;
    }

    static fromJson(v: string | any) : Fooglar {
        if(typeof v === "string") {
            return Fooglar.fromJson(JSON.parse(v));
        }
        else {
            return new Fooglar({
                    MESSAGE_SCHEMA_VERSION: v.MESSAGE_SCHEMA_VERSION,
                    name: v.name,
                    yearOfBirth: v.yearOfBirth,
                    fooglarType: FooglarTypeMap[v.fooglarType],
                    heightInKm: v.heightInKm,
                    aliases: v.aliases,
                    aliasAliases: v.aliasAliases,
                    threedeeDouble: v.threedeeDouble,
                    intsAPoppin: v.intsAPoppin
                }
            );
        }
    }

    toJSON() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            name: this.name,
            yearOfBirth: this.yearOfBirth,
            fooglarType: this.fooglarType,
            heightInKm: this.heightInKm,
            aliases: this.aliases,
            aliasAliases: this.aliasAliases,
            threedeeDouble: this.threedeeDouble,
            intsAPoppin: this.intsAPoppin
        };
    }
}


export interface CaseLite {
    readonly MESSAGE_SCHEMA_VERSION: string;

    id: number;
    description: string;
    suspects: Fooglar[];
}

export class Case implements CaseLite {
    readonly MESSAGE_SCHEMA_VERSION = "1.0.0";

    readonly id: number;
    readonly description: string;
    readonly suspects: Fooglar[];

    constructor(o: CaseLite) {
        this.id = o.id;
        this.description = o.description;
        this.suspects = o.suspects;
    }

    static fromJson(v: string | any) : Case {
        if(typeof v === "string") {
            return Case.fromJson(JSON.parse(v));
        }
        else {
            return new Case({
                    MESSAGE_SCHEMA_VERSION: v.MESSAGE_SCHEMA_VERSION,
                    id: v.id,
                    description: v.description,
                    suspects: v.suspects.map((v: any) => Fooglar.fromJson(v))
                }
            );
        }
    }

    toJSON() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            id: this.id,
            description: this.description,
            suspects: this.suspects
        };
    }
}


export interface FootectiveLite {
    readonly MESSAGE_SCHEMA_VERSION: string;

    name: string;
    alcoholic?: boolean | null;
    looseCannon?: boolean | null;
    cases: Case[];
    directReports: Footective[];
}

export class Footective implements FootectiveLite {
    readonly MESSAGE_SCHEMA_VERSION = "1.0.0";

    readonly name: string;
    readonly alcoholic?: boolean | null;
    readonly looseCannon?: boolean | null;
    readonly cases: Case[];
    readonly directReports: Footective[];

    constructor(o: FootectiveLite) {
        this.name = o.name;
        this.alcoholic = (o.alcoholic === null || o.alcoholic === undefined) ? null : o.alcoholic;
        this.looseCannon = (o.looseCannon === null || o.looseCannon === undefined) ? null : o.looseCannon;
        this.cases = o.cases;
        this.directReports = o.directReports;
    }

    static fromJson(v: string | any) : Footective {
        if(typeof v === "string") {
            return Footective.fromJson(JSON.parse(v));
        }
        else {
            return new Footective({
                    MESSAGE_SCHEMA_VERSION: v.MESSAGE_SCHEMA_VERSION,
                    name: v.name,
                    alcoholic: v.alcoholic,
                    looseCannon: v.looseCannon,
                    cases: v.cases.map((v: any) => Case.fromJson(v)),
                    directReports: v.directReports.map((v: any) => Footective.fromJson(v))
                }
            );
        }
    }

    toJSON() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            name: this.name,
            alcoholic: this.alcoholic,
            looseCannon: this.looseCannon,
            cases: this.cases,
            directReports: this.directReports
        };
    }
}
