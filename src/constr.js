import { ByteStream } from "@helios-lang/codec-utils"
import { decodeHead, encodeHead } from "./head.js"
import { decodeInt, encodeInt } from "./int.js"
import { decodeGeneric } from "./generic.js"
import { decodeList, encodeList } from "./list.js"

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
export function isConstr(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeHead(stream.copy())

    if (m == 6) {
        return (
            n == 102n || (n >= 121n && n <= 127) || (n >= 1280n && n <= 1400n)
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
        return encodeHead(6, 121n + BigInt(tag))
    } else if (tag >= 7 && tag <= 127) {
        return encodeHead(6, 1280n + BigInt(tag - 7))
    } else {
        return encodeHead(6, 102n)
            .concat(encodeHead(4, 2n))
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
 * @param {ByteArrayLike} bytes
 * @returns {number}
 */
function decodeConstrTag(bytes) {
    const stream = ByteStream.from(bytes)

    // constr
    const [m, n] = decodeHead(stream)

    if (m != 6) {
        throw new Error("unexpected")
    }

    if (n < 102n) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n == 102n) {
        const [mCheck, nCheck] = decodeHead(stream)
        if (mCheck != 4 || nCheck != 2n) {
            throw new Error("unexpected")
        }

        return Number(decodeInt(stream))
    } else if (n < 121n) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n <= 127n) {
        return Number(n - 121n)
    } else if (n < 1280) {
        throw new Error(`unexpected encoded constr tag ${n}`)
    } else if (n <= 1400) {
        return Number(n - 1280n + 7n)
    } else {
        throw new Error(`unexpected encoded constr tag ${n}`)
    }
}

/**
 * @template {Array<Decoder<any>> | Decoder<any>} Decoders
 * @param {ByteArrayLike} bytes
 * @param {Decoders extends Array ? [...Decoders] : Decoders} fieldDecoder - array for heterogenous item types, single function for homogenous item types
 * @returns {[
 *   number,
 *   Decoders extends Array ? {
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
