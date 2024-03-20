import { ByteStream } from "@helios-lang/codec-utils"
import { decodeHead, encodeHead, encodeIndefHead } from "./head.js"
import { decodeGeneric, encodeGeneric } from "./generic.js"

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
export function isMap(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, _] = decodeHead(stream.copy())

    return m == 5
}

/**
 * @param {[Encodeable, Encodeable][]} pairList already serialized
 * @returns {number[]}
 */
function encodeMapInternal(pairList) {
    /**
     * @type {number[]}
     */
    let res = []

    for (let pair of pairList) {
        const key = pair[0]
        const value = pair[1]

        res = res.concat(encodeGeneric(key))
        res = res.concat(encodeGeneric(value))
    }

    return res
}

/**
 * Encodes a list of key-value pairs.
 * @param {[Encodeable, Encodeable][]} pairList  Each key and each value is an already encoded list of CBOR bytes.
 * @returns {number[]}
 */
export function encodeDefMap(pairList) {
    return encodeHead(5, BigInt(pairList.length)).concat(
        encodeMapInternal(pairList)
    )
}

/**
 * Encodes a list of key-value pairs using the length undefined format.
 * @param {[Encodeable, Encodeable][]} pairList  Each key and each value is an already encoded list of CBOR bytes.
 * @returns {number[]}
 */
export function encodeIndefMap(pairList) {
    return encodeIndefHead(5).concat(encodeMapInternal(pairList)).concat([255])
}

/**
 * Unlike lists, the default serialization format for maps seems to always be the defined format
 * @param {[Encodeable, Encodeable][]} pairs already encoded
 * @returns {number[]}
 */
export function encodeMap(pairs) {
    return encodeDefMap(pairs)
}

/**
 * Internal use only, header already decoded
 * @template TKey
 * @template TValue
 * @param {ByteStream} stream
 * @param {number} n
 * @param {Decoder<TKey>} keyDecoder
 * @param {Decoder<TValue>} valueDecoder
 * @returns {[TKey, TValue][]}
 */
function decodeDefMap(stream, n, keyDecoder, valueDecoder) {
    /**
     * @type {[TKey, TValue][]}
     */
    const res = []

    for (let i = 0; i < n; i++) {
        res.push([
            decodeGeneric(stream, keyDecoder),
            decodeGeneric(stream, valueDecoder)
        ])
    }

    return res
}

/**
 * Used internally, head already decoded
 * @template TKey
 * @template TValue
 * @param {ByteStream} stream
 * @param {Decoder<TKey>} keyDecoder
 * @param {Decoder<TValue>} valueDecoder
 * @returns {[TKey, TValue][]}
 */
function decodeIndefMap(stream, keyDecoder, valueDecoder) {
    /**
     * @type {[TKey, TValue][]}
     */
    const res = []

    while (stream.peekOne() != 255) {
        res.push([
            decodeGeneric(stream, keyDecoder),
            decodeGeneric(stream, valueDecoder)
        ])
    }

    stream.shiftOne()

    return res
}

/**
 * Decodes a CBOR encoded map.
 * Calls a decoder function for each key-value pair (nothing is returned directly).
 *
 * The decoder function is responsible for separating the key from the value,
 * which are simply stored as consecutive CBOR elements.
 * @template TKey
 * @template TValue
 * @param {ByteArrayLike} bytes
 * @param {Decoder<TKey>} keyDecoder
 * @param {Decoder<TValue>} valueDecoder
 * @returns {[TKey, TValue][]}
 */
export function decodeMap(bytes, keyDecoder, valueDecoder) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeHead(stream)

    if (m != 5) {
        throw new Error("invalid map")
    }

    if (m == 5 && n == 31n) {
        return decodeIndefMap(stream, keyDecoder, valueDecoder)
    } else {
        return decodeDefMap(stream, Number(n), keyDecoder, valueDecoder)
    }
}
