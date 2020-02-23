import * as fs from "fs";
import * as jsoms from "./jsoms";

function main() {
    const jsomsSpec: string = fs.readFileSync("../../examples/example01.jsoms").toString();
    const jsonSpec: string = jsoms.toJson(jsomsSpec);

    console.log(jsonSpec);
}

main();
