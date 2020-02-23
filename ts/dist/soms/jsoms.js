"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toJson(jsomsString) {
    var re = new RegExp("\\w*//.*");
    var lines = jsomsString.split("\n");
    return lines
        .filter(function (line) { return !re.test(line); })
        .join("\n");
}
exports.toJson = toJson;
//# sourceMappingURL=jsoms.js.map