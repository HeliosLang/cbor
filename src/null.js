import { makeByteStream } from "@helios-lang/codec-utils"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 */

const NULL_BYTE = 246 // m = 7, n = 22

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isNull(bytes) {
    const stream = makeByteStream(bytes)

    return stream.peekOne() == NULL_BYTE
}

/**
 * Encode `null` into its CBOR representation.
 * @param {null} _null ignored
 * @returns {number[]}
 */
export function encodeNull(_null = null) {
    return [NULL_BYTE]
}

/**
 * Checks if next element in `bytes` is a `null`.
 * Throws an error if it isn't.
 * @param {BytesLike} bytes
 * @returns {null}
 */
export function decodeNull(bytes) {
    const stream = makeByteStream(bytes)

    const b = stream.shiftOne()

    if (b != NULL_BYTE) {
        throw new Error("not null")
    }

    return null
}
