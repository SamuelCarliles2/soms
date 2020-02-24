import * as fs from "fs";
import * as jsoms from "./jsoms";


function foo() {
    const jsomsSpec: string = fs.readFileSync("../../examples/example01.jsoms").toString();
    const jsonSpec: string = jsoms.toJson(jsomsSpec);

    console.log(jsonSpec);
}

function foo2() {
}

function main() {
    foo2();
}

interface FooFace {
    foo: string;
    bar: number;
}

class Foo implements FooFace {
    foo: string;
    bar: number;

    constructor(f: FooFace) {
        this.foo = f.foo;
        this.bar = f.bar;
    }

    static fromJson(s: string) : Foo {
        return new Foo(<FooFace>JSON.parse(s));
    }
}

main();
