import { ByteStream } from "@helios-lang/codec-utils"
import { decodeGeneric } from "./generic.js"
import { decodeList, decodeListLazy, encodeDefList, isList } from "./list.js"

/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder
 */

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 * @typedef {import("./generic.js").Encodeable} Encodeable
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
 * Needs to be imported because, although it is inferred here, typescript will include it in the final .d.ts file and api-extractor will complain about unresolveable symbols
 * @template T
 * @typedef {import("./generic.js").Decodeable<T>} Decodeable
 */

/**
 * Needs to be imported because, although it is inferred here, typescript will include it in the final .d.ts file and api-extractor will complain about unresolveable symbols
 * @template T
 * @typedef {import("./list.js").IndexedDecoder<T>} IndexedDecoder
 */

/**
 * @param {BytesLike} bytes
 */
export function decodeTupleLazy(bytes) {
    return decodeListLazy(bytes)
}
