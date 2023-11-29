import { describe, it } from "node:test"

import { deepEqual, strictEqual, throws } from "node:assert"
import { ByteStream, hexToBytes } from "@helios-lang/codec-utils"
import { decodeList, encodeList, isList } from "./list.js"
import { decodeInt } from "./int.js"

describe(isList.name, () => {
    it("returns true for [0x80]", () => {
        strictEqual(isList([0x80]), true)
    })

    it("returns false for [0x61, 0x61]", () => {
        strictEqual(isList([0x61, 0x61]), false)
    })

    it("returns false for [0]", () => {
        strictEqual(isList([0]), false)
    })

    it("fails for []", () => {
        throws(() => isList([]))
    })
})

describe(decodeList.name, () => {
    /**
     * @type {any}
     */
    const unusedItemDecoder = undefined

    it("fails for []", () => {
        throws(() => decodeList([], unusedItemDecoder))
    })

    it("fails for [0]", () => {
        throws(() => decodeList([0], unusedItemDecoder))
    })

    it("returns [] for [0x80]", () => {
        deepEqual(decodeList([0x80], unusedItemDecoder), [])
    })

    it("returns [] for [0x9f, 0xff]", () => {
        deepEqual(decodeList([0x9f, 0xff], unusedItemDecoder), [])
    })

    it("returns [1n,2n,3n] for #83010203", () => {
        deepEqual(decodeList(hexToBytes("83010203"), decodeInt), [1n, 2n, 3n])
    })

    it("returns [1n,2n,3n] for #83010203 with fromCbor method", () => {
        class TestInt {
            /**
             * @param {ByteStream} stream
             * @returns {bigint}
             */
            static fromCbor(stream) {
                return decodeInt(stream)
            }
        }

        deepEqual(decodeList(hexToBytes("83010203"), TestInt), [1n, 2n, 3n])
    })

    describe("returns [1n,2n,3n,4n, ..., 25n]", () => {
        const variants = [
            "98190102030405060708090a0b0c0d0e0f101112131415161718181819",
            "9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff"
        ]

        const expected = new Array(25).fill(0).map((_, i) => BigInt(i + 1))

        for (let v of variants) {
            it(`decodes #${v}`, () => {
                deepEqual(decodeList(hexToBytes(v), decodeInt), expected)
            })
        }
    })
})

describe(encodeList.name, () => {
    // see https://github.com/well-typed/cborg/blob/4bdc818a1f0b35f38bc118a87944630043b58384/serialise/src/Codec/Serialise/Class.hs#L181
    it("returns [0x80] for []", () => {
        deepEqual(encodeList([]), [0x80])
    })
})
