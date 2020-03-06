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

import {promises as fs} from "fs";
import {join as pathJoin} from "path";
import {tmpdir} from "os";

import {
    Case, Fooglar, FooglarType, Footective
} from "./out/ts/example01";


async function main(args: string[]) {
    if(args.length > 2) {
        console.log(
            JSON.stringify(
                Footective.fromJson(
                    (await fs.readFile(args[2])).toString()
                ),
                null,
                4
            )
        );
    }
    else {
        const tmpDir = await fs.mkdtemp(
            pathJoin(tmpdir(), "soms_"), {}
        );

        await fs.writeFile(
            pathJoin(tmpDir, "footective1.json"),
            JSON.stringify(
                new Footective({
                    MESSAGE_SCHEMA_VERSION: "1.0.0",
                    name: "McGarnagle",
                    alcoholic: true,
                    looseCannon: true,
                    directReports: [
                        new Footective(
                            {
                                MESSAGE_SCHEMA_VERSION: "1.0.0",
                                name: "Sipowicz",
                                alcoholic: true,
                                looseCannon: true,
                                directReports: [],
                                cases: [
                                    new Case({
                                        MESSAGE_SCHEMA_VERSION: "1.0.0",
                                        id: 12345,
                                        description: "Find the swishy pants",
                                        suspects: [
                                            new Fooglar({
                                                MESSAGE_SCHEMA_VERSION: "1.0.0",
                                                name: "John the Cat",
                                                yearOfBirth: 1904,
                                                heightInKm: 0.0018796,
                                                fooglarType: FooglarType.CAT,
                                                aliases: [],
                                                aliasAliases: [[]],
                                                threedeeDouble: [
                                                    [
                                                        [0.0, 0.1, 0.2],
                                                        [0.3, 0.4, 0.5]
                                                    ],
                                                    [
                                                        [0.6, 0.7, 0.8],
                                                        [0.9, 1.0, 1.1]
                                                    ]
                                                ],
                                                intsAPoppin: [[[]]]
                                            })
                                        ]
                                    })
                                ]
                            }
                        )
                    ],
                    cases: []
                }),
                null, 4
            )
        );
    }
}

main(process.argv).then();
