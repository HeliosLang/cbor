import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeGeneric } from "./generic.js"
import { decodeList, decodeListLazy, encodeDefList, isList } from "./list.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import { Decodeable, Decoder, Encodeable, IndexedDecoder } from "./index.js"
 */

/**
 * @param {BytesLike} bytes
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
 * @param {BytesLike} bytes
 * @param {[...Decoders]} itemDecoders
 * @param {[...OptionalDecoders] | []} optionalDecoders - default to empty tuple
 * @returns {[
 *   ...{[D in keyof Decoders]: Decoders[D] extends Decoder<infer T> ? T : never},
 *   ...({[D in keyof OptionalDecoders]: OptionalDecoders[D] extends Decoder<infer T> ? (T | undefined) : never})
 * ]}
 */
export function decodeTuple(bytes, itemDecoders, optionalDecoders = []) {
    const stream = makeByteStream(bytes)

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
                        itemDecoders.length + optionalDecoders.length
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

/**
 * @param {BytesLike} bytes
 * @returns {<T>(itemDecoder: IndexedDecoder<T> | Decodeable<T>) => T}
 */
export function decodeTupleLazy(bytes) {
    return decodeListLazy(bytes)
}
