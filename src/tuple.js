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
 * @template {Array<Decoder<any>>} [OptionalDecoders=[]] - uninferable in the default case, so must be default to empty tuple
 * @param {ByteArrayLike} bytes
 * @param {[...Decoders]} itemDecoders
 * @param {[...OptionalDecoders] | []} optionalDecoders - default to empty tuple
 * @returns {[
 *   ...{[D in keyof Decoders]: Decoders[D] extends Decoder<infer T> ? T : never},
 *   ...({[D in keyof OptionalDecoders]: OptionalDecoders[D] extends Decoder<infer T> ? Option<T> : never})
 * ]}
 */
export function decodeTuple(bytes, itemDecoders, optionalDecoders = []) {
    const stream = ByteStream.from(bytes)

    /**
     * decodeList is the right decoder, but has the wrong type interface
     * Cast the result to `any` to avoid type errors
     * @type {any}
     */
    const res = decodeList(stream, (itemStream, i) => {
        let decoder = itemDecoders[i]

        if (!decoder) {
            decoder = optionalDecoders[i - itemDecoders.length]

            if (!decoder) {
                throw new Error(
                    `expected at most ${
                        itemDecoders.length +
                        (optionalDecoders ? optionalDecoders.length : 0)
                    } items, got more than ${i}`
                )
            }
        }

        return decodeGeneric(itemStream, decoder)
    })

    if (res.length < itemDecoders.length) {
        throw new Error(
            `expected at least ${itemDecoders.length} items, only got ${res.length}`
        )
    }

    return res
}
