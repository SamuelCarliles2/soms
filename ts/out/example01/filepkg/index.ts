export interface OneMoreLite {
    name: string;

    projectToAny() : any;
}

export class OneMore implements OneMoreLite {

    readonly name: string;

    constructor(o: OneMoreLite) {
        this.name = o.name;
    }

    static fromJson(s: string) : OneMore {
        return new OneMore(<OneMoreLite>JSON.parse(s));
    }

    toJson(space?: string | number) : string {
        return JSON.stringify(this.projectToAny(), null, space);
    }

    projectToAny() : any {
        return {
            name: this.name
        };
    }
}
