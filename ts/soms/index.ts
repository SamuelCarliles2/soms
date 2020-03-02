import * as fs from "fs";

import {SomsConfig, Somspiler} from "./somspiler";


Somspiler
.fromConfig(
    <SomsConfig>JSON.parse(
        fs.readFileSync("./somsconfig.json").toString()
    )
)
.somspile()
.map(p => { console.log(JSON.stringify(p, null, "  ")); });
