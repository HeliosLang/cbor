import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { decodeNull, encodeNull, isNull } from "./null.js"

const NULL_CBOR_BYTE = 0xf6

describe(isNull.name, () => {
    it(`returns true for [${NULL_CBOR_BYTE}]`, () => {
        strictEqual(isNull([NULL_CBOR_BYTE]), true)
    })

    it(`fails for empty bytes`, () => {
        throws(() => isNull([]))
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
