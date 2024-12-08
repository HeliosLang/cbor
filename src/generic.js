/**
 * @import { ByteStream } from "@helios-lang/codec-utils"
 * @import { Decoder, Encodeable } from "./index.js"
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
