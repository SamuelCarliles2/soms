import * as fs from "fs";

import {ConcreteSomsConfig, SomsConfig, Somspiler} from "./somspiler";
import {TsGenerator} from "./generators/tsgen";
import {CppGenerator} from "./generators/cppgen";


const cfg = new ConcreteSomsConfig(
    <SomsConfig>JSON.parse(
        fs.readFileSync("./somsconfig.json").toString()
    )
);

new TsGenerator()
.generate(Somspiler.fromConfig(cfg).somspile())
.map(
    s => {
        const dirName = (cfg.outDir + "/" + s.filename).replace(new RegExp("/[^/]+$"), "");
        fs.mkdirSync(dirName, { recursive: true });
        fs.writeFileSync(cfg.outDir + "/" + s.filename, s.source);
    }
);

/*
new CppGenerator()
.generate(Somspiler.fromConfig(cfg).somspile())
.map(
    s => {
        console.log(s.filename);
        console.log(s.source);
        fs.writeFileSync(".\\" + s.filename.split("\\")[s.filename.split("\\").length-1], s.source);
    }
);

*/