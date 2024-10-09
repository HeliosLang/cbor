import { ByteStream } from "@helios-lang/codec-utils"
import { decodeGeneric } from "./generic.js"
import { decodeDefHead, encodeDefHead } from "./head.js"
import { decodeInt, encodeInt } from "./int.js"
import { decodeList, decodeListLazy, encodeList } from "./list.js"

/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder<T>
 */

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isConstr(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeDefHead(stream.copy())

    if (m == 6) {
        return (
            n == 102n || (n >= 121n && n <= 127n) || (n >= 1280n && n <= 1400n)
        )
    } else {
        return false
    }
}

/**
 * Encode a constructor tag of a ConstrData type
 * @param {number} tag
 * @returns {number[]}
 */
function encodeConstrTag(tag) {
    if (tag < 0 || tag % 1.0 != 0.0) {
        throw new Error("invalid tag")
    } else if (tag >= 0 && tag <= 6) {
        return encodeDefHead(6, 121n + BigInt(tag))
    } else if (tag >= 7 && tag <= 127) {
        return encodeDefHead(6, 1280n + BigInt(tag - 7))
    } else {
        return encodeDefHead(6, 102n)
            .concat(encodeDefHead(4, 2n))
            .concat(encodeInt(BigInt(tag)))
    }
}

/**
 * Note: internally the indef list format is used if the number of fields is > 0, if the number of fields is 0 the def list format is used
 *   see [well-typed/cborg/serialise/src/Codec/Serialise/Class.hs](https://github.com/well-typed/cborg/blob/4bdc818a1f0b35f38bc118a87944630043b58384/serialise/src/Codec/Serialise/Class.hs#L181).
 * @param {number} tag
 * @param {Encodeable[]} fields
 * @returns {number[]}
 */
export function encodeConstr(tag, fields) {
    return encodeConstrTag(tag).concat(encodeList(fields))
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
function decodeConstrTag(bytes) {
    const stream = ByteStream.from(bytes)

    // constr
    const [m, n] = decodeDefHead(stream)

    if (m != 6) {
        throw new Error("unexpected")
    }

    if (n < 102n) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n == 102n) {
        const [mCheck, nCheck] = decodeDefHead(stream)
        if (mCheck != 4 || nCheck != 2n) {
            throw new Error("unexpected")
        }

        return Number(decodeInt(stream))
    } else if (n < 121n) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n <= 127n) {
        return Number(n - 121n)
    } else if (n < 1280n) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n <= 1400n) {
        return Number(n - 1280n + 7n)
    } else {
        throw new Error(`unexpected encoded constr tag ${n}`)
    }
}

/**
 * The homogenous field type case is used by the uplc ConstrData (undetermined number of UplcData items)
 * @template {[Decoder<any>, ...Decoder<any>[]] | Array<Decoder<any>> | Decoder<any>} Decoders
 * @param {BytesLike} bytes
 * Note: the conditional tuple check loses the tupleness if we just check against array, hence first we check against a tuple, and then an array (needed for the empty case)
 * @param {Decoders extends [Decoder<any>, ...Decoder<any>[]] ? [...Decoders] : Decoders extends Array<any> ? [...Decoders] : Decoders} fieldDecoder - array for heterogenous item types, single function for homogenous item types
 * @returns {[
 *   number,
 *   Decoders extends Array<any> ? {
 *     [D in keyof Decoders]: Decoders[D] extends Decoder<infer T> ? T : never
 *   } : Decoders extends Decoder<infer T> ? T[] : never
 * ]}
 */
export function decodeConstr(bytes, fieldDecoder) {
    const stream = ByteStream.from(bytes)

    const tag = decodeConstrTag(stream)

    /**
     * @type {any}
     */
    const res = decodeList(stream, (itemStream, i) => {
        if (Array.isArray(fieldDecoder)) {
            const decoder = fieldDecoder[i]

            if (!decoder) {
                throw new Error(
                    `expected ${fieldDecoder.length} fields, got more than ${i}`
                )
            }

            return decodeGeneric(itemStream, decoder)
        } else {
            return decodeGeneric(itemStream, fieldDecoder)
        }
    })

    if (Array.isArray(fieldDecoder)) {
        if (res.length < fieldDecoder.length) {
            throw new Error(
                `expected ${fieldDecoder.length} fields, only got ${res.length}`
            )
        }
    }

    return [tag, res]
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
export function decodeConstrLazy(bytes) {
    const stream = ByteStream.from(bytes)
    const tag = decodeConstrTag(stream)
    const decodeField = decodeListLazy(bytes)

    return /** @type {[number, typeof decodeField]} */ ([tag, decodeField])
}
