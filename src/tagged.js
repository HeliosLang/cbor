import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeConstrLazy } from "./constr.js"
import { decodeInt } from "./int.js"
import { decodeListLazy, isList } from "./list.js"

/**
 * @template T
 * @typedef {import("./generic.js").Decodeable<T>} Decodeable
 */

/**
 * @template T
 * @typedef {import("./list.js").IndexedDecoder<T>} IndexedDecoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 */

/**
 * @param {BytesLike} bytes
 * @returns {[number, <T>(itemDecoder: IndexedDecoder<T> | Decodeable<T>) => T]}
 */
export function decodeTagged(bytes) {
    const stream = makeByteStream({ bytes })

    if (isList(stream)) {
        const decodeItem = decodeListLazy(stream)

        const tag = Number(decodeItem(decodeInt))

        return /** @type {[number, typeof decodeItem]} */ ([tag, decodeItem])
    } else {
        return decodeConstrLazy(stream)
    }
}
