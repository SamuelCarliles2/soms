export enum FooglarType {
    ART = "ART",
    CAT = "CAT",
    JEWEL = "JEWEL"
}

export interface FooglarLite {
    readonly MESSAGE_SCHEMA_VERSION: string;

    name: string;
    yearOfBirth?: number;
    fooglarType: FooglarType;
    heightInKm: number;
    aliases: string[];
    aliasAliases: string[][];
    threedeeDouble: number[][][];
    intsAPoppin: number[][][];

    projectToAny() : any;
}

export class Fooglar implements FooglarLite {
    readonly MESSAGE_SCHEMA_VERSION = "1.0.0";
    static readonly DEFAULT_CATCH? = false;
    static readonly DEFAULT_FOOGLAR_TYPE? = FooglarType.CAT;
    static readonly DISCOUNT_RATE? = 0.1;
    static readonly MIN_HAUL? = 100000;

    readonly name: string;
    readonly yearOfBirth: number;
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

    static fromJson(s: string) : Fooglar {
        return new Fooglar(<FooglarLite>JSON.parse(s));
    }

    toJson(space?: string | number) : string {
        return JSON.stringify(this.projectToAny(), null, space);
    }

    projectToAny() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            name: this.name,
            yearOfBirth: this.yearOfBirth,
            fooglarType: JSON.stringify(this.fooglarType),
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

    projectToAny() : any;
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

    static fromJson(s: string) : Case {
        return new Case(<CaseLite>JSON.parse(s));
    }

    toJson(space?: string | number) : string {
        return JSON.stringify(this.projectToAny(), null, space);
    }

    projectToAny() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            id: this.id,
            description: this.description,
            suspects: this.suspects.map(v => v.projectToAny())
        };
    }
}


export interface FootectiveLite {
    readonly MESSAGE_SCHEMA_VERSION: string;

    name: string;
    alcoholic?: boolean;
    looseCannon?: boolean;
    cases: Case[];
    directReports: Footective[];

    projectToAny() : any;
}

export class Footective implements FootectiveLite {
    readonly MESSAGE_SCHEMA_VERSION = "1.0.0";

    readonly name: string;
    readonly alcoholic: boolean;
    readonly looseCannon: boolean;
    readonly cases: Case[];
    readonly directReports: Footective[];

    constructor(o: FootectiveLite) {
        this.name = o.name;
        this.alcoholic = (o.alcoholic === null || o.alcoholic === undefined) ? null : o.alcoholic;
        this.looseCannon = (o.looseCannon === null || o.looseCannon === undefined) ? null : o.looseCannon;
        this.cases = o.cases;
        this.directReports = o.directReports;
    }

    static fromJson(s: string) : Footective {
        return new Footective(<FootectiveLite>JSON.parse(s));
    }

    toJson(space?: string | number) : string {
        return JSON.stringify(this.projectToAny(), null, space);
    }

    projectToAny() : any {
        return {
            MESSAGE_SCHEMA_VERSION: this.MESSAGE_SCHEMA_VERSION,
            name: this.name,
            alcoholic: this.alcoholic,
            looseCannon: this.looseCannon,
            cases: this.cases.map(v => v.projectToAny()),
            directReports: this.directReports.map(v => v.projectToAny())
        };
    }
}
