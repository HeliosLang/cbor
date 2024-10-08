import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes, ByteStream } from "@helios-lang/codec-utils"
import { decodeInt, encodeInt } from "./int.js"
import { decodeTag, encodeTag } from "./tag.js"

describe(encodeTag.name, () => {
    it("returns #c11a514b67b0 for 1(1363896240n)", () => {
        deepEqual(
            encodeTag(1).concat(encodeInt(1363896240n)),
            hexToBytes("c11a514b67b0")
        )
    })

    it("fails for a negative tag", () => {
        throws(() => encodeTag(-1))
    })
})

describe(decodeTag.name, () => {
    it("returns 1 for #c11a514b67b0", () => {
        strictEqual(decodeTag(hexToBytes("c11a514b67b0")), 1n)
    })

    it(`returns 1363896240 after calling ${decodeTag.name} on #c11a514b67b0`, () => {
        const stream = new ByteStream(hexToBytes("c11a514b67b0"))
        decodeTag(stream)
        strictEqual(decodeInt(stream), 1363896240n)
    })

    it("fails for []", () => {
        throws(() => decodeTag([]))
    })

    it("fails for [0]", () => {
        throws(() => decodeTag([0]))
    })
})
