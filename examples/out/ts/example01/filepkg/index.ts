export interface OneMoreLite {
    name: string;
}

export class OneMore implements OneMoreLite {

    readonly name: string;

    constructor(o: OneMoreLite) {
        this.name = o.name;
    }

    static fromJson(v: string | any) : OneMore {
        if(typeof v === "string") {
            return OneMore.fromJson(JSON.parse(v));
        }
        else {
            return new OneMore({
                    name: v.name
                }
            );
        }
    }

    toJSON() : any {
        return {
            name: this.name
        };
    }
}
