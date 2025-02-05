import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { makeByteStream } from "@helios-lang/codec-utils"
import { encodeInt } from "./int.js"
import { decodeNull, encodeNull, isNull } from "./null.js"

const NULL_CBOR_BYTE = 0xf6

describe(isNull.name, () => {
    it(`returns true for [${NULL_CBOR_BYTE}]`, () => {
        strictEqual(isNull([NULL_CBOR_BYTE]), true)
    })

    it(`fails for empty bytes`, () => {
        throws(() => isNull([]))
    })

    it("doesn't change stream pos", () => {
        const stream = makeByteStream([NULL_CBOR_BYTE])

        strictEqual(isNull(stream), true)
        strictEqual(stream.pos, 0)
    })

    it("doesn't change stream pos if not null", () => {
        const stream = makeByteStream(encodeInt(0))

        strictEqual(isNull(stream), false)
        strictEqual(stream.pos, 0)
    })
})

describe(decodeNull.name, () => {
    it("fails for empty bytes", () => {
        throws(() => decodeNull([]))
    })

    it("fails for [0]", () => {
        throws(() => decodeNull([0]))
    })

    it(`returns null for [${NULL_CBOR_BYTE}]`, () => {
        strictEqual(decodeNull([NULL_CBOR_BYTE]), null)
    })
})

describe(encodeNull.name, () => {
    it(`returns [${NULL_CBOR_BYTE}]`, () => {
        deepEqual(encodeNull(), [NULL_CBOR_BYTE])
    })
})
