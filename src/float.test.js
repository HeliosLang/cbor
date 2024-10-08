import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex } from "@helios-lang/codec-utils"
import {
    decodeFloat,
    decodeFloat16,
    decodeFloat32,
    decodeFloat64,
    encodeFloat16,
    encodeFloat32,
    encodeFloat64,
    isFloat,
    isFloat16,
    isFloat32,
    isFloat64
} from "./float.js"

/**
 * Taken from https://github.com/cbor/test-vectors/blob/master/appendix_a.json
 * @type {[number[], number][]}
 */
const testVector = [
    [[0xf9, 0x00, 0x00], 0.0],
    [[0xf9, 0x80, 0x00], -0.0],
    [[0xf9, 0x3c, 0x00], 1.0],
    [[0xfb, 0x3f, 0xf1, 0x99, 0x99, 0x99, 0x99, 0x99, 0x9a], 1.1],
    [[0xf9, 0x3e, 0x00], 1.5],
    [[0xf9, 0x7b, 0xff], 65504.0],
    [[0xfa, 0x47, 0xc3, 0x50, 0x00], 100000.0],
    [[0xfa, 0x7f, 0x7f, 0xff, 0xff], 3.4028234663852886e38],
    [[0xfb, 0x7e, 0x37, 0xe4, 0x3c, 0x88, 0x00, 0x75, 0x9c], 1.0e300],
    [[0xf9, 0x00, 0x01], 5.960464477539063e-8],
    [[0xf9, 0x04, 0x00], 6.103515625e-5],
    [[0xf9, 0xc4, 0x00], -4.0],
    [[0xfb, 0xc0, 0x10, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66], -4.1],
    [[0xf9, 0x7c, 0x00], Number.POSITIVE_INFINITY],
    [[0xf9, 0x7e, 0x00], Number.NaN],
    [[0xf9, 0xfc, 0x00], Number.NEGATIVE_INFINITY],
    [[0xfa, 0x7f, 0x80, 0x00, 0x00], Number.POSITIVE_INFINITY],
    [[0xfa, 0x7f, 0xc0, 0x00, 0x00], Number.NaN],
    [[0xfa, 0xff, 0x80, 0x00, 0x00], Number.NEGATIVE_INFINITY],
    [
        [0xfb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        Number.POSITIVE_INFINITY
    ],
    [[0xfb, 0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], Number.NaN],
    [
        [0xfb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        Number.NEGATIVE_INFINITY
    ]
]

describe(decodeFloat.name, () => {
    testVector.forEach(([bytes, f]) => {
        it(`decodes #${bytesToHex(bytes)} as ${f}`, () => {
            strictEqual(decodeFloat(bytes), f)
        })
    })

    it("fails for non-float cbor", () => {
        throws(() => {
            decodeFloat([0])
        })
    })
})

describe(decodeFloat16.name, () => {
    testVector
        .filter(([bytes, f]) => bytes.length == 3 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            strictEqual(decodeFloat16(bytes), f)
            throws(() => {
                decodeFloat32(bytes)
            })
            throws(() => {
                decodeFloat64(bytes)
            })
        })
})

describe(decodeFloat32.name, () => {
    // NaN has a variety of representations, so we won't test that here
    testVector
        .filter(([bytes, f]) => bytes.length == 5 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            throws(() => {
                decodeFloat16(bytes)
            })
            strictEqual(decodeFloat32(bytes), f)
            throws(() => {
                decodeFloat64(bytes)
            })
        })
})

describe(decodeFloat64.name, () => {
    // NaN has a variety of representations, so we won't test that here
    testVector
        .filter(([bytes, f]) => bytes.length == 9 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            throws(() => {
                decodeFloat16(bytes)
            })
            throws(() => {
                decodeFloat32(bytes)
            })
            strictEqual(decodeFloat64(bytes), f)
        })
})

describe(encodeFloat16.name, () => {
    // NaN has a variety of representations, so will won't test that here
    testVector
        .filter(([bytes, f]) => bytes.length == 3 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            it(`encodes ${f} as #${bytesToHex(bytes)}`, () => {
                deepEqual(encodeFloat16(f), bytes)
                strictEqual(isFloat(bytes), true)
                strictEqual(isFloat16(bytes), true)
                strictEqual(isFloat32(bytes), false)
                strictEqual(isFloat64(bytes), false)
            })
        })
})

describe(encodeFloat32.name, () => {
    // NaN has a variety of representations, so we won't test that here
    testVector
        .filter(([bytes, f]) => bytes.length == 5 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            it(`encodes ${f} as #${bytesToHex(bytes)}`, () => {
                deepEqual(encodeFloat32(f), bytes)
                strictEqual(isFloat(bytes), true)
                strictEqual(isFloat16(bytes), false)
                strictEqual(isFloat32(bytes), true)
                strictEqual(isFloat64(bytes), false)
            })
        })
})

describe(encodeFloat64.name, () => {
    // NaN has a variety of representations, so we don't test that here
    testVector
        .filter(([bytes, f]) => bytes.length == 9 && !Number.isNaN(f))
        .forEach(([bytes, f]) => {
            it(`encodes ${f} as #${bytesToHex(bytes)}`, () => {
                deepEqual(encodeFloat64(f), bytes)
                strictEqual(isFloat(bytes), true)
                strictEqual(isFloat16(bytes), false)
                strictEqual(isFloat32(bytes), false)
                strictEqual(isFloat64(bytes), true)
            })
        })
})
