import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { decodeInt, encodeInt } from "./int.js"
import { decodeTagged } from "./tagged.js"
import { encodeTuple } from "./tuple.js"

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

    it("returns tag 0 for d87982581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980 (plain const)", () => {
        const [tag, _] = decodeTagged(
            "d87982581cbd99a373075d42fe4ac9109515e46303d0940cb9620bf058b87986a9d87980"
        )

        strictEqual(tag, 0)
    })
})
