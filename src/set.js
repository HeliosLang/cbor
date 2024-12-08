import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeList, encodeDefList } from "./list.js"
import { decodeTag, isTag } from "./tag.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import { Decodeable, Encodeable, IndexedDecoder } from "./index.js"
 */

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
        decodeTag(stream)
    }

    return decodeList(bytes, itemDecoder)
}

/**
 * Exactly like encodeDefList, doesn't yet include the tag
 * @param {Encodeable[]} items
 * @returns {number[]}
 */
export function encodeSet(items) {
    return encodeDefList(items)
}
