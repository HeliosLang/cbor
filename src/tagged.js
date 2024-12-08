import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeConstrLazy } from "./constr.js"
import { decodeInt } from "./int.js"
import { decodeListLazy, isList } from "./list.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import { Decodeable, IndexedDecoder } from "./index.js"
 */

/**
 * @param {BytesLike} bytes
 * @returns {[number, <T>(itemDecoder: IndexedDecoder<T> | Decodeable<T>) => T]}
 */
export function decodeTagged(bytes) {
    const stream = makeByteStream(bytes)

    if (isList(stream)) {
        const decodeItem = decodeListLazy(stream)

        const tag = Number(decodeItem(decodeInt))

        return /** @type {[number, typeof decodeItem]} */ ([tag, decodeItem])
    } else {
        return decodeConstrLazy(stream)
    }
}
