/**
 * @typedef {import("@helios-lang/codec-utils").ByteStream} ByteStream
 */

/**
 * @template T
 * @typedef {{fromCbor: (stream: ByteStream) => T}} Decodeable
 */

/**
 * @template T
 * @typedef {((stream: ByteStream) => T) | Decodeable<T>} Decoder<T>
 */

/**
 * @typedef {number[] | {toCbor: () => number[]}} Encodeable
 */

/**
 * @template T
 * @param {ByteStream} stream
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
