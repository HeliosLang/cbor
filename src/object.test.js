import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes } from "@helios-lang/codec-utils"
import { decodeBool } from "./bool.js"
import { decodeInt, encodeInt } from "./int.js"
import { decodeList } from "./list.js"
import {
    decodeObjectIKey,
    decodeObjectSKey,
    encodeObjectIKey,
    encodeObjectSKey,
    isObject
} from "./object.js"
import { decodeString, encodeString } from "./string.js"

describe(isObject.name, () => {
    it("fails for []", () => {
        throws(() => isObject([]))
    })

    it("returns false for [0]", () => {
        strictEqual(isObject([0]), false)
    })

    it("returns true for #a201020304", () => {
        strictEqual(isObject(hexToBytes("a201020304")), true)
    })
})

describe(decodeObjectIKey.name, () => {
    it("returns {1: 2n, 3: 4n} for #a201020304", () => {
        const actual = decodeObjectIKey(hexToBytes("a201020304"), {
            1: decodeInt,
            3: decodeInt
        })
        deepEqual(actual, { 1: 2n, 3: 4n })
    })
})

describe(encodeObjectIKey.name, () => {
    it("returns #a201020304 for {1: 2n, 3: 4n}", () => {
        deepEqual(
            encodeObjectIKey({
                1: encodeInt(2n),
                3: encodeInt(4n)
            }),
            hexToBytes("a201020304")
        )
    })

    it("returns #a201020304 for Map({1: 2n, 3: 4n})", () => {
        deepEqual(
            encodeObjectIKey(
                new Map([
                    [1, encodeInt(2n)],
                    [3, encodeInt(4n)]
                ])
            ),
            hexToBytes("a201020304")
        )
    })
})

describe(decodeObjectSKey.name, () => {
    it("returns {a: 1n, b: [2n, 3n]} for #a26161016162820203", () => {
        const actual = decodeObjectSKey(hexToBytes("a26161016162820203"), {
            a: decodeInt,
            b: (stream) => decodeList(stream, decodeInt)
        })

        deepEqual(actual, { a: 1n, b: [2n, 3n] })
    })

    it('returns {a: "A", b: "B", c: "C", d: "D", e: "E"} for #a56161614161626142616361436164614461656145', () => {
        const actual = decodeObjectSKey(
            hexToBytes("a56161614161626142616361436164614461656145"),
            {
                a: decodeString,
                b: decodeString,
                c: decodeString,
                d: decodeString,
                e: decodeString
            }
        )

        deepEqual(actual, {
            a: "A",
            b: "B",
            c: "C",
            d: "D",
            e: "E"
        })
    })

    it("returns {Fun: true, Amt: -2} for #bf6346756ef563416d7421ff", () => {
        const actual = decodeObjectSKey(
            hexToBytes("bf6346756ef563416d7421ff"),
            {
                Fun: decodeBool,
                Amt: decodeInt
            }
        )

        deepEqual(actual, { Fun: true, Amt: -2n })
    })

    it("fails for #bf6346756ef563416d7421ff if Amt decoder isn't specified", () => {
        throws(() =>
            decodeObjectSKey(hexToBytes("bf6346756ef563416d7421ff"), {
                Fun: decodeBool
            })
        )
    })
})

describe(encodeObjectSKey.name, () => {
    it('returns #a56161614161626142616361436164614461656145 for {a: "A", b: "B", c: "C", d: "D", e: "E"}', () => {
        deepEqual(
            encodeObjectSKey({
                a: encodeString("A"),
                b: encodeString("B"),
                c: encodeString("C"),
                d: encodeString("D"),
                e: encodeString("E")
            }),
            hexToBytes("a56161614161626142616361436164614461656145")
        )
    })

    it('returns #a56161614161626142616361436164614461656145 for Map({a: "A", b: "B", c: "C", d: "D", e: "E"})', () => {
        deepEqual(
            encodeObjectSKey(
                new Map([
                    ["a", encodeString("A")],
                    ["b", encodeString("B")],
                    ["c", encodeString("C")],
                    ["d", encodeString("D")],
                    ["e", encodeString("E")]
                ])
            ),
            hexToBytes("a56161614161626142616361436164614461656145")
        )
    })
})
