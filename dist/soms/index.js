"use strict";
/*
MIT License

Copyright (c) 2020 Samuel Carliles

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var somspiler_1 = require("./somspiler");
var tsgen_1 = require("./generators/tsgen");
var cfg = new somspiler_1.ConcreteSomsConfig(JSON.parse(fs.readFileSync("./somsconfig.json").toString()));
new tsgen_1.TsGenerator()
    .generate(somspiler_1.Somspiler.fromConfig(cfg).somspile())
    .map(function (s) {
    var dirName = (cfg.outDir + "/" + s.filename).replace(new RegExp("/[^/]+$"), "");
    fs.mkdirSync(dirName, { recursive: true });
    fs.writeFileSync(cfg.outDir + "/" + s.filename, s.source);
});
//# sourceMappingURL=index.js.map