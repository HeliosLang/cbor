import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeGeneric, encodeGeneric } from "./generic.js"
import { decodeListLazyOption, encodeList } from "./list.js"
import { decodeNull, encodeNull, isNull } from "./null.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import { Decoder, Encodeable } from "./index.js"
 */

/**
 * @template T
 * @param {BytesLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {T | undefined}
 */
export function decodeNullOption(bytes, decodeSome) {
    const stream = makeByteStream(bytes)

    if (isNull(stream)) {
        return decodeNull(stream) ?? undefined
    } else {
        return decodeGeneric(stream, decodeSome)
    }
}

/**
 * @template T
 * @param {BytesLike} bytes
 * @param {Decoder<T>} decodeSome
 * @returns {T | undefined}
 */
export function decodeListOption(bytes, decodeSome) {
    const decodeItem = decodeListLazyOption(bytes)

    return decodeItem(decodeSome)
}

/**
 * @param {Encodeable | undefined} option
 * @returns {number[]}
 */
export function encodeNullOption(option) {
    return option ? encodeGeneric(option) : encodeNull()
}

/**
 * @param {Encodeable | undefined} option
 * @returns {number[]}
 */
export function encodeListOption(option) {
    return encodeList(option ? [encodeGeneric(option)] : [])
}
