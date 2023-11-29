import { ByteStream } from "@helios-lang/codec-utils"

const NULL_BYTE = 246

/**
 * @param {number[] | ByteStream} bytes
 * @returns {boolean}
 */
export function isNull(bytes) {
    const stream = ByteStream.from(bytes)

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
 * @param {number[] | ByteStream} bytes
 * @returns {null}
 */
export function decodeNull(bytes) {
    const stream = ByteStream.from(bytes)

    const b = stream.shiftOne()

    if (b != NULL_BYTE) {
        throw new Error("not null")
    }

    return null
}
