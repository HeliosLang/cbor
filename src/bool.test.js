import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeBool, encodeBool, isBool } from "./bool.js"
import { encodeInt } from "./int.js"

const FALSE_CBOR_BYTE = 0xf4
const TRUE_CBOR_BYTE = 0xf5

describe(isBool.name, () => {
    it("fails for empty bytes", () => {
        throws(() => isBool([]))
    })

    it(`returns true for [${FALSE_CBOR_BYTE}]`, () => {
        strictEqual(isBool([FALSE_CBOR_BYTE]), true)
    })

    it(`returns true for [${TRUE_CBOR_BYTE}]`, () => {
        strictEqual(isBool([TRUE_CBOR_BYTE]), true)
    })

    it("doesn't change stream pos", () => {
        const stream = makeByteStream([TRUE_CBOR_BYTE])

        strictEqual(isBool(stream), true)
        strictEqual(stream.pos, 0)
    })

    it("doesn't change stream pos if not a bool", () => {
        const stream = makeByteStream(encodeInt(0))

        strictEqual(isBool(stream), false)
        strictEqual(stream.pos, 0)
    })
})

describe(decodeBool.name, () => {
    it(`returns false for [${FALSE_CBOR_BYTE}]`, () => {
        strictEqual(decodeBool([FALSE_CBOR_BYTE]), false)
    })

    it(`returns true for [${TRUE_CBOR_BYTE}]`, () => {
        strictEqual(decodeBool([TRUE_CBOR_BYTE]), true)
    })

    it("fails for [0xf6]", () => {
        throws(() => decodeBool([0xf6]))
    })

    it("fails for [0xf3]", () => {
        throws(() => decodeBool([0xf3]))
    })

    it("fails for empty bytes", () => {
        throws(() => decodeBool([]))
    })
})

describe(encodeBool.name, () => {
    it(`returns [${FALSE_CBOR_BYTE}] for false`, () => {
        deepEqual(encodeBool(false), [FALSE_CBOR_BYTE])
    })

    it(`returns [${TRUE_CBOR_BYTE}] for true`, () => {
        deepEqual(encodeBool(true), [TRUE_CBOR_BYTE])
    })
})
