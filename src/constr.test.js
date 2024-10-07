import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { decodeBytes, encodeBytes } from "./bytes.js"
import { decodeConstr, encodeConstr, isConstr } from "./constr.js"
import { encodeDefHead } from "./head.js"
import { decodeInt, encodeInt } from "./int.js"
import { decodeList, encodeList } from "./list.js"

const tagsTestVector = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110,
    120, 130, 140, 150, 160, 170, 180, 190, 200, 1000, 2000, 3000, 4000, 5000
]

describe(isConstr.name, () => {
    it("returns true for #d87982581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980", () => {
        strictEqual(
            isConstr(
                hexToBytes(
                    "d87982581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980"
                )
            ),
            true
        )
    })

    tagsTestVector.forEach((t) => {
        it(`returns true for encoded ${t}`, () => {
            strictEqual(isConstr(encodeConstr(t, [])), true)
        })
    })

    it("returns false for [0]]", () => {
        strictEqual(isConstr([0]), false)
    })

    it("fails for []]", () => {
        throws(() => isConstr([]))
    })
})

describe(decodeConstr.name, () => {
    // test vectors taken from https://github.com/input-output-hk/plutus/blob/master/plutus-core/plutus-core/test/CBOR/DataStability.hs#L83
    describe("returns [0, [#bd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9, [0, []]]]", () => {
        const expected = [
            0,
            [
                hexToBytes(
                    "bd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9"
                ),
                [0, []]
            ]
        ]

        const testVectors = [
            "d87982581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980",
            "d8799f581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980ff"
        ]

        testVectors.forEach((v) => {
            it(`ok for ${v}`, () => {
                const actual = decodeConstr(hexToBytes(v), [
                    decodeBytes,
                    (stream) => decodeConstr(stream, [])
                ])

                deepEqual(actual, expected)
            })

            it(`fails for ${v} too few field decoders`, () => {
                throws(() => decodeConstr(hexToBytes(v), [decodeBytes]))
            })

            it(`fails for ${v} too many field decoders`, () => {
                throws(() =>
                    decodeConstr(hexToBytes(v), [
                        decodeBytes,
                        (stream) => decodeConstr(stream, []),
                        decodeInt
                    ])
                )
            })
        })
    })

    it("fails for []", () => {
        throws(() => decodeConstr([], []))
    })

    it("fails for [0]", () => {
        throws(() => decodeConstr([0], []))
    })

    describe(`returns [0, [[0,[[[0, [[], [[0, [[], 2123n]]]]]], [[0, [[], [[0, [[], 2223n]]]]]]]]]]`, () => {
        const expected = [
            0,
            [
                [
                    0,
                    [
                        [[0, [[], [[0, [[], 2123n]]]]]],
                        [[0, [[], [[0, [[], 2223n]]]]]]
                    ]
                ]
            ]
        ]

        const testVectors = [
            "d87981d8798281d879824081d879824019084b81d879824081d87982401908af",
            "d8799fd8799f9fd8799f409fd8799f4019084bffffffff9fd8799f409fd8799f401908afffffffffffff"
        ]

        testVectors.forEach((v) => {
            it(`ok for ${v}`, () => {
                const actual = decodeConstr(hexToBytes(v), [
                    (stream) =>
                        decodeConstr(stream, [
                            (stream) =>
                                decodeList(stream, (stream) => {
                                    return decodeConstr(stream, [
                                        decodeBytes,
                                        (stream) =>
                                            decodeList(stream, (stream) =>
                                                decodeConstr(stream, [
                                                    decodeBytes,
                                                    decodeInt
                                                ])
                                            )
                                    ])
                                }),
                            (stream) =>
                                decodeList(stream, (stream) => {
                                    return decodeConstr(stream, [
                                        decodeBytes,
                                        (stream) =>
                                            decodeList(stream, (stream) =>
                                                decodeConstr(stream, [
                                                    decodeBytes,
                                                    decodeInt
                                                ])
                                            )
                                    ])
                                })
                        ])
                ])

                deepEqual(actual, expected)
            })
        })
    })
})

describe(`${encodeConstr.name}`, () => {
    it("returns #d8799f581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980ff for [0, [#bd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9, [0, []]]]", () => {
        deepEqual(
            encodeConstr(0, [
                encodeBytes(
                    hexToBytes(
                        "bd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9"
                    )
                ),
                encodeConstr(0, [])
            ]),
            hexToBytes(
                "d8799f581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980ff"
            )
        )
    })

    it("returns #d8799fd8799f9fd8799f409fd8799f4019084bffffffff9fd8799f409fd8799f401908afffffffffffff for [0, [[0,[[[0, [[], [[0, [[], 2123n]]]]]], [[0, [[], [[0, [[], 2223n]]]]]]]]]]", () => {
        deepEqual(
            encodeConstr(0, [
                encodeConstr(0, [
                    encodeList([
                        encodeConstr(0, [
                            encodeBytes([]),
                            encodeList([
                                encodeConstr(0, [
                                    encodeBytes([]),
                                    encodeInt(2123n)
                                ])
                            ])
                        ])
                    ]),
                    encodeList([
                        encodeConstr(0, [
                            encodeBytes([]),
                            encodeList([
                                encodeConstr(0, [
                                    encodeBytes([]),
                                    encodeInt(2223n)
                                ])
                            ])
                        ])
                    ])
                ])
            ]),
            hexToBytes(
                "d8799fd8799f9fd8799f409fd8799f4019084bffffffff9fd8799f409fd8799f401908afffffffffffff"
            )
        )
    })
})

describe("bad constr tags", () => {
    it("fails for a negative tag", () => {
        throws(() => encodeConstr(-1, []))
    })

    it("fails for a non-whole number tag", () => {
        throws(() => encodeConstr(3.14, []))
    })

    const badEncodedTags = [101, 103, 120, 128, 1279, 1401, 2000]

    badEncodedTags.forEach((t) => {
        it(`fails decoding tag ${t}`, () => {
            throws(() =>
                decodeConstr(
                    encodeDefHead(6, BigInt(t)).concat(encodeList([])),
                    []
                )
            )
        })
    })

    it(`fails for tag 102 with bad second header`, () => {
        throws(() =>
            decodeConstr(
                encodeDefHead(6, 102n)
                    .concat(encodeDefHead(0, 0n))
                    .concat(encodeInt(0n))
                    .concat(encodeList([])),
                []
            )
        )
    })
})

describe(`roundtrip ${encodeConstr.name}/${decodeConstr.name} homogenous field type`, () => {
    it(`ok for [0, 1, 2, 3]`, () => {
        const tag = 0
        const fields = [0n, 1n, 2n, 3n]

        const actual = decodeConstr(
            encodeConstr(
                tag,
                fields.map((item) => encodeInt(item))
            ),
            decodeInt
        )

        deepEqual(actual, [tag, fields])
    })
})

describe(`tag only roundtrip ${encodeConstr.name}/${decodeConstr.name}`, () => {
    tagsTestVector.forEach((t) => {
        it(`ok for ${t}`, () => {
            deepEqual(decodeConstr(encodeConstr(t, []), []), [t, []])
        })
    })
})
