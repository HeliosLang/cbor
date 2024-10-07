import { describe, it } from "node:test"
import { decodeTuple, decodeTupleLazy, encodeTuple } from "./tuple.js"
import { deepEqual, strictEqual, throws } from "node:assert"
import { ByteStream, hexToBytes } from "@helios-lang/codec-utils"
import { decodeInt, encodeInt } from "./int.js"
import { decodeList } from "./list.js"
import { decodeString, encodeString } from "./string.js"
import { decodeObjectSKey, encodeObjectSKey } from "./object.js"
import { isTuple } from "./tuple.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

describe(isTuple.name, () => {
    it("fails for []", () => {
        throws(() => isTuple([]))
    })

    it("returns false for [0]", () => {
        strictEqual(isTuple([0]), false)
    })

    it("returns true for #8301820203820405", () => {
        strictEqual(isTuple(hexToBytes("8301820203820405")), true)
    })
})

describe(decodeTuple.name, () => {
    describe("returns [1n, [2n, 3n], [4n, 5n]]", () => {
        /**
         * @type {[bigint, bigint[], bigint[]]}
         */
        const expected = [1n, [2n, 3n], [4n, 5n]]

        const variants = [
            "8301820203820405",
            "9f018202039f0405ffff",
            "9f01820203820405ff",
            "83018202039f0405ff",
            "83019f0203ff820405"
        ]

        for (let v of variants) {
            it(`decodes #${v}`, () => {
                const actual = decodeTuple(hexToBytes(v), [
                    decodeInt,
                    (stream) => decodeList(stream, decodeInt),
                    (stream) => decodeList(stream, decodeInt)
                ])

                deepEqual(actual, expected)
            })
        }
    })

    it('returns ["a", {b: "c"}] for #826161a161626163', () => {
        const actual = decodeTuple(hexToBytes("826161a161626163"), [
            decodeString,
            (stream) => decodeObjectSKey(stream, { b: decodeString })
        ])

        deepEqual(actual, ["a", { b: "c" }])
    })

    it('returns ["a", {b: "c"}] for #826161bf61626163ff', () => {
        const actual = decodeTuple(hexToBytes("826161bf61626163ff"), [
            decodeString,
            (stream) => decodeObjectSKey(stream, { b: decodeString })
        ])

        deepEqual(actual, ["a", { b: "c" }])
    })

    it('returns ["a", {b: "c"}] for #826161bf61626163ff, with the second decoder being optional', () => {
        /**
         * @satisfies {[string, Option<{b?: string}>]}
         */
        const actual = decodeTuple(hexToBytes("826161bf61626163ff"), [
            decodeString,
        ], [
            /**
             * @param {ByteArrayLike} stream 
             * @returns {{b?: string}}
             */
            (stream) => decodeObjectSKey(stream, { b: decodeString })
        ])

        deepEqual(actual, ["a", { b: "c" }])
    })

    it("fails if an optional decoder is missing for third entry", () => {
        throws(() => {
            decodeTuple(encodeTuple([encodeString("a"), encodeObjectSKey({b: encodeString("c")}), encodeInt(0)]), [
                decodeString,
            ], [
                /**
                 * @param {ByteArrayLike} stream 
                 * @returns {{b?: string}}
                 */
                (stream) => decodeObjectSKey(stream, { b: decodeString })
            ])
        })
    })

    it('returns ["a", {b: "c"}] for #826161bf61626163ff with fromCbor methods', () => {
        class TestString {
            /**
             * @param {ByteStream} stream
             * @returns {string}
             */
            static fromCbor(stream) {
                return decodeString(stream)
            }
        }

        class TestObject {
            /**
             * @param {ByteStream} stream
             * @returns {{b?: string}}
             */
            static fromCbor(stream) {
                return decodeObjectSKey(stream, { b: decodeString })
            }
        }

        const actual = decodeTuple(hexToBytes("826161bf61626163ff"), [
            TestString,
            TestObject
        ])

        deepEqual(actual, ["a", { b: "c" }])
    })

    it("fails for #826161bf61626163ff when decoding 3 items", () => {
        throws(() =>
            decodeTuple(hexToBytes("826161bf61626163ff"), [
                decodeString,
                (stream) => decodeObjectSKey(stream, { b: decodeString }),
                decodeString
            ])
        )
    })

    it("fails for #826161bf61626163ff when decoding only 1 item", () => {
        throws(() =>
            decodeTuple(hexToBytes("826161bf61626163ff"), [decodeString])
        )
    })

    it("fails for #826161bf61626163ff when decoding 0 items", () => {
        throws(() => {
            const res = decodeTuple(hexToBytes("826161bf61626163ff"), [])
        })
    })
})


describe(decodeTupleLazy.name, () => {
    it("fails for []", () => {
        throws(() => decodeTupleLazy([]))
    })

    it("fails for [0]", () => {
        throws(() => decodeTupleLazy([0]))
    })

    it("succeeds when not calling the callback for [0x80] (i.e. empty list)", () => {
        decodeTupleLazy([0x80])
    })

    it("fails when calling the callback for [0x80] (i.e. empty list)", () => {
        const callback = decodeTupleLazy([0x80])

        throws(() => {
            callback(decodeInt)
        }, /end-of-list/)
    })

    it("returns [1n,\"hello world\"]", () => {
        const callback = decodeTupleLazy(encodeTuple([encodeInt(1), encodeString("hello world")]))

        strictEqual(callback(decodeInt), 1n)
        strictEqual(callback(decodeString), "hello world")

        throws(() => {
            callback(decodeInt)
        }, /end-of-list/)
    })
})

describe(encodeTuple.name, () => {
    it('returns #826161a161626163 for ["a", {b: "c"}]', () => {
        deepEqual(
            encodeTuple([
                encodeString("a"),
                encodeObjectSKey({ b: encodeString("c") })
            ]),
            hexToBytes("826161a161626163")
        )
    })

    it('returns #826161a161626163 for ["a", {b: "c"}] using toCbor() methods', () => {
        deepEqual(
            encodeTuple([
                { toCbor: () => encodeString("a") },
                {
                    toCbor: () =>
                        encodeObjectSKey({
                            b: { toCbor: () => encodeString("c") }
                        })
                }
            ]),
            hexToBytes("826161a161626163")
        )
    })
})
