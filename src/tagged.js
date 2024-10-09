import { ByteStream } from "@helios-lang/codec-utils"
import { decodeConstrLazy } from "./constr.js"
import { decodeInt } from "./int.js"
import { decodeListLazy, isList } from "./list.js"

/**
 * Needs to be imported because, although it is inferred here, typescript will include it in the final .d.ts file and api-extractor will complain about unresolveable symbol
 * @template T
 * @typedef {import("./generic.js").Decodeable<T>} Decodeable
 */

/**
 * Needs to be imported because, although it is inferred here, typescript will include it in the final .d.ts file and api-extractor will complain about unresolveable symbol
 * @template T
 * @typedef {import("./list.js").IndexedDecoder<T>} IndexedDecoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 */

/**
 * @param {BytesLike} bytes
 */
export function decodeTagged(bytes) {
    const stream = ByteStream.from(bytes)

    if (isList(stream)) {
        const decodeItem = decodeListLazy(stream)

        const tag = Number(decodeItem(decodeInt))

        return /** @type {[number, typeof decodeItem]} */ ([tag, decodeItem])
    } else {
        return decodeConstrLazy(stream)
    }
}
