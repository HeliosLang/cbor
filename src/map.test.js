import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { decodeMap, encodeDefMap, encodeIndefMap, encodeMap, isMap } from "./map.js"
import { decodeInt, encodeInt } from "./int.js"
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

    it("doesn't fail for int -> string map with 31 entries", () => {
        const cborHex = "b81f18736a6765745f6d696e746564187c683c7377697463683e1887683c7377697463683e188a683c7377697463683e1894683c7377697463683e1897683c7377697463683e18a1683c7377697463683e18a4683c7377697463683e18ae683c7377697463683e18b2683c7377697463683e18bc683c7377697463683e18c0683c7377697463683e18ca683c7377697463683e18ce683c7377697463683e18d8683c7377697463683e18dc683c7377697463683e18e6683c7377697463683e18e9683c61737369676e3e18f2683c7377697463683e18fc683c7377697463683e190100683c7377697463683e19010a683c7377697463683e19010e683c7377697463683e190118683c7377697463683e19011c683c7377697463683e190126683c7377697463683e190129683c7377697463683e190133683c7377697463683e190136683c7377697463683e19013b6f696e6469726563745f706f6c69637919013d683c61737369676e3e"

        decodeMap(cborHex, decodeInt, decodeString)
    })
})

describe(encodeDefMap.name, () => {
    it("encoding a def map with 31 entries should be decodeable", () => {
        const cbor = encodeDefMap(new Array(31).fill(0).map(i => [encodeInt(i), encodeString(i.toString())]))

        decodeMap(cbor, decodeInt, decodeString)
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