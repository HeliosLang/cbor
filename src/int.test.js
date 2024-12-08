import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex } from "@helios-lang/codec-utils"
import { decodeInt, encodeInt, isInt } from "./int.js"

/**
 * @import { IntLike } from "@helios-lang/codec-utils"
 */

/**
 * @type {[IntLike, number[]][]}
 */
const testVectors = [
    [0, [0]],
    [1, [1]],
    [10, [10]],
    [23, [23]],
    [24n, [24, 24]],
    [25n, [24, 25]],
    [100, [24, 100]],
    [1000, [25, 3, 232]],
    [1000000n, [0x1a, 0, 0x0f, 0x42, 0x40]],
    [1000000000000n, [0x1b, 0, 0, 0, 0xe8, 0xd4, 0xa5, 0x10, 0]],
    [
        18446744073709551615n,
        [0x1b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
    ],
    [18446744073709551616n, [0xc2, 0x49, 1, 0, 0, 0, 0, 0, 0, 0, 0]],
    [
        -18446744073709551616n,
        [0x3b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
    ],
    [-18446744073709551617n, [0xc3, 0x49, 1, 0, 0, 0, 0, 0, 0, 0, 0]],
    [-1, [0x20]],
    [-10, [0x29]],
    [-100, [0x38, 0x63]],
    [-1000, [0x39, 0x03, 0xe7]]
]

describe(isInt.name, () => {
    testVectors.forEach(([_, bs]) => {
        it(`returns true for #${bytesToHex(bs)}`, () => {
            strictEqual(isInt(bs), true)
        })
    })

    it("returns false for #6161", () => {
        strictEqual(isInt([0x61, 0x61]), false)
    })

    it("fails for []", () => {
        throws(() => isInt([]))
    })
})

describe(decodeInt.name, () => {
    testVectors.forEach(([x, bs]) => {
        it(`returns ${x} for #${bytesToHex(bs)}`, () => {
            strictEqual(decodeInt(bs), BigInt(x))
        })
    })

    it("fails for [24]", () => {
        throws(() => decodeInt([24]))
    })

    it("fails for empty bytes", () => {
        throws(() => decodeInt([]))
    })
})

describe(encodeInt.name, () => {
    testVectors.forEach(([x, bs]) => {
        it(`returns #${bytesToHex(bs)} for ${x}`, () => {
            deepEqual(encodeInt(x), bs)
        })
    })
})
