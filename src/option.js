import { ByteStream } from "@helios-lang/codec-utils"
import { decodeNull, encodeNull, isNull } from "./null.js"
import { None } from "@helios-lang/type-utils"
import { decodeGeneric } from "./generic.js"
/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

/**
 * @template T
 * @param {ByteArrayLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {Option<T>}
 */
export function decodeOption(bytes, decodeSome) {
    const stream = ByteStream.from(bytes)

    if (isNull(stream)) {
        return decodeNull(stream) ?? None
    } else {
        return decodeGeneric(stream, decodeSome)
    }
}

/**
 * @template T
 * @param {Option<T>} option
 * @param {(some: T) => number[]} encodeSome
 */
export function encodeOption(option, encodeSome) {
    return option ? encodeSome(option) : encodeNull()
}
