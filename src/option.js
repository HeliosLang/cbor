import { ByteStream } from "@helios-lang/codec-utils"
import { decodeNull, encodeNull, isNull } from "./null.js"
import { None } from "@helios-lang/type-utils"
import { decodeGeneric, encodeGeneric } from "./generic.js"
import { decodeListLazyOption, encodeList } from "./list.js"
/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @template T
 * @param {ByteArrayLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {Option<T>}
 */
export function decodeNullOption(bytes, decodeSome) {
    const stream = ByteStream.from(bytes)

    if (isNull(stream)) {
        return decodeNull(stream) ?? None
    } else {
        return decodeGeneric(stream, decodeSome)
    }
}

/**
 * @template T
 * @param {ByteArrayLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {Option<T>}
 */
export function decodeListOption(bytes, decodeSome) {
    const decodeItem = decodeListLazyOption(bytes)

    return decodeItem(decodeSome)
}

/**
 * @template T
 * @param {Option<Encodeable>} option
 */
export function encodeNullOption(option) {
    return option ? encodeGeneric(option) : encodeNull()
}

/**
 * @param {Option<Encodeable>} option
 * @returns {number[]}
 */
export function encodeListOption(option) {
    return encodeList(option ? [encodeGeneric(option)] : [])
}
