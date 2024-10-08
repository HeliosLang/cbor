import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { bytesToHex, hexToBytes } from "@helios-lang/codec-utils"
import { decodeBytes, encodeBytes, isBytes, isDefBytes } from "./bytes.js"
import { encodeInt } from "./int.js"
import { encodeDefList } from "./list.js"

describe(isBytes.name, () => {
    it("fails for empty bytes", () => {
        throws(() => isBytes([]))
    })

    it("returns false for [0]", () => {
        strictEqual(isBytes([0]), false)
    })

    it("returns true for #4e4d01000033222220051200120011", () => {
        strictEqual(isBytes(hexToBytes("4e4d01000033222220051200120011")), true)
    })
})

describe(isDefBytes.name, () => {
    it("fails for empty bytes", () => {
        throws(() => isDefBytes([]))
    })

    it("returns false for [0]", () => {
        strictEqual(isDefBytes([0]), false)
    })

    it("returns false for indef bytes", () => {
        strictEqual(isDefBytes([2 * 32 + 31]), false)
    })

    it("returns true for #4e4d01000033222220051200120011", () => {
        strictEqual(
            isDefBytes(hexToBytes("4e4d01000033222220051200120011")),
            true
        )
    })
})

describe(decodeBytes.name, () => {
    it("returns [] for [0x40]", () => {
        deepEqual(decodeBytes([0x40]), [])
    })

    it("returns [1,2,3,4] for #4401020304", () => {
        deepEqual(decodeBytes(hexToBytes("4401020304")), [1, 2, 3, 4])
    })

    it("returns #4d01000033222220051200120011 for #4e4d01000033222220051200120011", () => {
        deepEqual(
            decodeBytes(hexToBytes("4e4d01000033222220051200120011")),
            hexToBytes("4d01000033222220051200120011")
        )
    })

    it("fails when trying to decode a list", () => {
        throws(() => {
            decodeBytes(encodeDefList([encodeInt(0)]))
        })
    })
})

describe(encodeBytes.name, () => {
    it("returns #4e4d01000033222220051200120011 for #4d01000033222220051200120011", () => {
        deepEqual(
            encodeBytes(hexToBytes("4d01000033222220051200120011")),
            hexToBytes("4e4d01000033222220051200120011")
        )
    })
})

describe(`roundtrip ${encodeBytes.name}/${decodeBytes.name}`, () => {
    const testVector = []

    for (let i = 0; i < 100; i++) {
        testVector.push(
            new Array(i)
                .fill(0)
                .map(() => Math.floor(256 * Math.random()) % 256)
        )
    }

    testVector.forEach((v, i) => {
        const split = i % 2 == 0

        it(`ok for ${bytesToHex(v)}`, () => {
            deepEqual(decodeBytes(encodeBytes(v, split)), v)
        })
    })
})
