/**
 * @typedef {import("@helios-lang/codec-utils").ByteStreamI} ByteStreamI
 */

/**
 * @template T
 * @typedef {{fromCbor: (stream: ByteStreamI) => T}} Decodeable
 */

/**
 * @template T
 * @typedef {((stream: ByteStreamI) => T) | Decodeable<T>} Decoder<T>
 */

/**
 * @typedef {number[] | {toCbor: () => number[]}} Encodeable
 */

/**
 * @template T
 * @param {ByteStreamI} stream
 * @param {Decoder<T>} decoder
 * @returns {T}
 */
export function decodeGeneric(stream, decoder) {
    if (decoder && "fromCbor" in decoder) {
        return decoder.fromCbor(stream)
    } else {
        return decoder(stream)
    }
}

/**
 * @param {Encodeable} encodeable
 * @returns {number[]}
 */
export function encodeGeneric(encodeable) {
    if (Array.isArray(encodeable)) {
        return encodeable
    } else {
        return encodeable.toCbor()
    }
}
