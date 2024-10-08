import { ByteStream } from "@helios-lang/codec-utils"
import { decodeGeneric, encodeGeneric } from "./generic.js"
import {
    decodeDefHead,
    encodeDefHead,
    encodeIndefHead,
    peekMajorType
} from "./head.js"

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
    return peekMajorType(bytes) == 5
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
function isIndefMap(bytes) {
    const stream = ByteStream.from(bytes)

    return 5 * 32 + 31 == stream.peekOne()
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
    return encodeDefHead(5, BigInt(pairList.length)).concat(
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

    if (isIndefMap(stream)) {
        void stream.shiftOne()

        return decodeIndefMap(stream, keyDecoder, valueDecoder)
    } else {
        const [m, n] = decodeDefHead(stream)

        if (m != 5) {
            throw new Error("invalid def map")
        }

        return decodeDefMap(stream, Number(n), keyDecoder, valueDecoder)
    }
}
