"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var jsoms = require("./jsoms");
function main() {
    var jsomsSpec = fs.readFileSync("../../examples/example01.jsoms").toString();
    var jsonSpec = jsoms.toJson(jsomsSpec);
    console.log(jsonSpec);
}
main();
//# sourceMappingURL=index.js.map