import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { decodeMap, encodeIndefMap, encodeMap, isMap } from "./map.js"
import { decodeInt } from "./int.js"
import { decodeString, encodeString } from "./string.js"

describe(isMap.name, () => {
    it("returns true for [0xa0]", () => {
        strictEqual(isMap([0xa0]), true)
    })

    it("returns false for [0]", () => {
        strictEqual(isMap([0]), false)
    })

    it("fails for []", () => {
        throws(() => isMap([]))
    })
})

describe(decodeMap.name, () => {
    /**
     * @type {any}
     */
    const unusedKeyDecoder = undefined

    /**
     * @type {any}
     */
    const unusedValueDecoder = undefined

    it("fails for []", () => {
        throws(() => decodeMap([], unusedKeyDecoder, unusedValueDecoder))
    })

    it("fails for [0]", () => {
        throws(() => decodeMap([0], unusedKeyDecoder, unusedValueDecoder))
    })

    it("returns [] for [0xa0]", () => {
        deepEqual(decodeMap([0xa0], unusedKeyDecoder, unusedValueDecoder), [])
    })

    it("returns [[1n, 2n], [3n, 4n]] for #a201020304", () => {
        deepEqual(decodeMap(hexToBytes("a201020304"), decodeInt, decodeInt), [
            [1n, 2n],
            [3n, 4n]
        ])
    })
})

describe(`roundtrip ${encodeMap.name}/${decodeMap.name}`, () => {
    /**
     * @type {[string, string][][]}
     */
    const testVectors = [
        [],
        [["a", "A"]],
        [
            ["a", "A"],
            ["b", "B"]
        ],
        [
            ["a", "A"],
            ["b", "B"],
            ["c", "C"]
        ],
        [
            ["a", "A"],
            ["b", "B"],
            ["c", "C"],
            ["d", "D"]
        ],
        [
            ["a", "A"],
            ["b", "B"],
            ["c", "C"],
            ["d", "D"],
            ["e", "E"]
        ],
        [
            ["a", "A"],
            ["b", "B"],
            ["c", "C"],
            ["d", "D"],
            ["e", "E"],
            ["f", "F"]
        ]
    ]

    testVectors.forEach((v) => {
        it(`ok for ${JSON.stringify(v)}`, () => {
            deepEqual(
                decodeMap(
                    encodeMap(
                        v.map(([k, v]) => [encodeString(k), encodeString(v)])
                    ),
                    decodeString,
                    decodeString
                ),
                v
            )
        })

        it(`ok for ${JSON.stringify(v)} (indef encoding)`, () => {
            deepEqual(
                decodeMap(
                    encodeIndefMap(
                        v.map(([k, v]) => [encodeString(k), encodeString(v)])
                    ),
                    decodeString,
                    decodeString
                ),
                v
            )
        })
    })
})
