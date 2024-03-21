/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

import { ByteStream } from "@helios-lang/codec-utils"
import { decodeInt } from "./int.js"
import { decodeListLazy, isList } from "./list.js"
import { decodeConstrLazy } from "./constr.js"

/**
 * @param {ByteArrayLike} bytes
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
