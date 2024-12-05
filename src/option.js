import { makeByteStream } from "@helios-lang/codec-utils"
import { None } from "@helios-lang/type-utils"
import { decodeGeneric, encodeGeneric } from "./generic.js"
import { decodeListLazyOption, encodeList } from "./list.js"
import { decodeNull, encodeNull, isNull } from "./null.js"

/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @template T
 * @param {BytesLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {Option<T>}
 */
export function decodeNullOption(bytes, decodeSome) {
    const stream = makeByteStream(bytes)

    if (isNull(stream)) {
        return decodeNull(stream) ?? None
    } else {
        return decodeGeneric(stream, decodeSome)
    }
}

/**
 * @template T
 * @param {BytesLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {Option<T>}
 */
export function decodeListOption(bytes, decodeSome) {
    const decodeItem = decodeListLazyOption(bytes)

    return decodeItem(decodeSome)
}

/**
 * @param {Option<Encodeable>} option
 * @returns {number[]}
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
