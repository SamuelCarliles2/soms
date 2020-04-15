#!/usr/bin/env node

/*
MIT License

Copyright (c) 2020 Samuel Carliles, Marcus Hansen, and Promit Roy

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

import * as fs from "fs";

import {
    ConcreteSomsConfig, SomsConfig, SomsGeneratorConfig, Somspiler
} from "./somspiler";
import {TsGenerator} from "./generators/tsgen";
import {SomsPackage} from "./somstree";
import {FileSource, SomsGenerator} from "./somsgenerator";
import {CppGenerator} from "./generators/cppgen";

const cfg = new ConcreteSomsConfig(
    <SomsConfig>JSON.parse(
        fs.readFileSync("./somsconfig.json").toString()
    )
);

const main = async () : Promise<void> => {
    const somsTrees: SomsPackage[] = Somspiler.fromConfig(cfg).somspile();
    const pGenerators: Promise<SomsGenerator>[] = cfg.generators.map(
        gc => (
            async () : Promise<SomsGenerator> => {
                const mod = await import("./" + gc.importPath);
                return <SomsGenerator>(new mod[gc.className]());
            }
        )()
    );
    pGenerators.map(
        (pGen, i) => {
            pGen.then((gen: SomsGenerator) => {
                const outDir =
                    (cfg.outDir + "/" + cfg.generators[i].outDir + "/")
                    .replace(new RegExp("/[^/]+$"), "")
                    .replace(/\/+/g, "/");
                gen.generate(somsTrees).map((s: FileSource) => {
                    const filename = outDir + s.filename;
                    const dirName = filename.substring(0, filename.lastIndexOf("/"));
                    fs.mkdirSync(dirName, { recursive: true });
                    fs.writeFileSync(filename, s.source);
                });
            });
        }
    );
};

main().then();
