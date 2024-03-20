import { ByteStream } from "@helios-lang/codec-utils"
import { decodeList, encodeDefList, isList } from "./list.js"
import { decodeGeneric } from "./generic.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */
/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder<T>
 */

/**
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isTuple(bytes) {
    return isList(bytes)
}

/**
 * @param {Encodeable[]} tuple
 * @returns {number[]}
 */
export function encodeTuple(tuple) {
    return encodeDefList(tuple)
}

/**
 * @template {Array<Decoder<any>>} Decoders
 * @param {ByteArrayLike} bytes
 * @param {[...Decoders]} itemDecoders
 * @returns {{[D in keyof Decoders]: Decoders[D] extends Decoder<infer T> ? T : never}}
 */
export function decodeTuple(bytes, itemDecoders) {
    const stream = ByteStream.from(bytes)

    /**
     * decodeList is right decoder, but has the wrong type interface
     * Cast the result to `any` to avoid type errors
     * @type {any}
     */
    const res = decodeList(stream, (itemStream, i) => {
        const decoder = itemDecoders[i]

        if (!decoder) {
            throw new Error(
                `expected ${itemDecoders.length} items, got more than ${i}`
            )
        }

        return decodeGeneric(itemStream, decoder)
    })

    if (res.length < itemDecoders.length) {
        throw new Error(
            `expected ${itemDecoders.length} items, only got ${res.length}`
        )
    }

    return res
}
