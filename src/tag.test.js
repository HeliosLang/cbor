import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes, makeByteStream } from "@helios-lang/codec-utils"
import { decodeInt, encodeInt } from "./int.js"
import { decodeTag, encodeTag, isTag } from "./tag.js"

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
        const stream = makeByteStream(hexToBytes("c11a514b67b0"))
        decodeTag(stream)
        strictEqual(decodeInt(stream), 1363896240n)
    })

    it("fails for []", () => {
        throws(() => decodeTag([]))
    })

    it("fails for [0]", () => {
        throws(() => decodeTag([0]))
    })

    it("decodes tag in d90102 as 258", () => {
        strictEqual(decodeTag("d90102"), 258n)
    })
})

describe(isTag.name, () => {
    it("detects tag in d90102", () => {
        strictEqual(isTag("d90102"), true)
    })

    it("detects tag in set of signatures", () => {
        strictEqual(
            isTag(
                "d901028182582044f3523cc794ecd0e4cc6aa5d459d4c0b30064d7f7f68dac0eb0653819861b985840ad8a1887d409ca2c5205a9002b104ff77ddee415d730fd85925399e622c6840c2a0c68b72d4bd57979f1d9fec70c6ee7b15a01607da98119dddf05420e274e0a"
            ),
            true
        )
    })
})
