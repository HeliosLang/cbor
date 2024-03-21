import { describe, it } from "node:test"
import { decodeTagged } from "./tagged.js"
import { encodeTuple } from "./tuple.js"
import { decodeInt, encodeInt } from "./int.js"
import { deepEqual, throws } from "assert"

describe(decodeTagged.name, () => {
    it("returns 1 when decoding first item of tuple [0, 1]", () => {
        const tupleBytes = encodeTuple([encodeInt(0), encodeInt(1)])

        const [tag, decodeItem] = decodeTagged(tupleBytes)

        deepEqual([tag, decodeItem(decodeInt)], [0, 1n])
    })

    it("fails when decoding too many items", () => {
        const tupleBytes = encodeTuple([encodeInt(0), encodeInt(1)])

        const decodeItem = decodeTagged(tupleBytes)[1]

        decodeItem(decodeInt)

        throws(() => decodeItem(decodeInt))
    })
})
