import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeList, encodeDefList } from "./list.js"
import { decodeTag, encodeTag, isTag, peekTag } from "./tag.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import { Decodeable, Encodeable, IndexedDecoder } from "./index.js"
 */

const SET_TAG = 258n

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isSet(bytes) {
    if (isTag(bytes)) {
        return peekTag(bytes) == SET_TAG
    } else {
        return false
    }
}

/**
 * Like a list, but with an optional 258 tag
 * See: https://github.com/Emurgo/cardano-serialization-lib/releases/tag/13.0.0
 * @template T
 * @param {BytesLike} bytes
 * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
 * @returns {T[]}
 */
export function decodeSet(bytes, itemDecoder) {
    const stream = makeByteStream(bytes)

    if (isTag(stream)) {
        const tag = decodeTag(stream)
        if (tag != SET_TAG) {
            throw new Error(
                `expected tag ${SET_TAG.toString()} for set, got tag ${tag.toString()}`
            )
        }
    }

    return decodeList(bytes, itemDecoder)
}

/**
 * A tagged def list (tag 258n)
 * @param {Encodeable[]} items
 * @returns {number[]}
 */
export function encodeSet(items) {
    return encodeTag(SET_TAG).concat(encodeDefList(items))
}
