import { makeByteStream } from "@helios-lang/codec-utils"

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 */

const FALSE_BYTE = 244 // m = 7, n = 20
const TRUE_BYTE = 245 // m = 7, n = 21

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isBool(bytes) {
    const stream = makeByteStream({ bytes })

    const b = stream.peekOne()

    return b == FALSE_BYTE || b == TRUE_BYTE
}

/**
 * Encodes a `boolean` into its CBOR representation.
 * @param {boolean} b
 * @returns {number[]}
 */
export function encodeBool(b) {
    if (b) {
        return [TRUE_BYTE]
    } else {
        return [FALSE_BYTE]
    }
}

/**
 * Decodes a CBOR encoded `boolean`.
 * Throws an error if the next element in bytes isn't a `boolean`.
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function decodeBool(bytes) {
    const stream = makeByteStream({ bytes })

    const b = stream.shiftOne()

    if (b == TRUE_BYTE) {
        return true
    } else if (b == FALSE_BYTE) {
        return false
    } else {
        throw new Error("unexpected non-boolean cbor object")
    }
}
