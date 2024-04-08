import { ByteStream } from "@helios-lang/codec-utils"
import { decodeInt, encodeInt } from "./int.js"
import { decodeString, encodeString } from "./string.js"
import { isMap, encodeDefMap, decodeMap } from "./map.js"
import { decodeGeneric } from "./generic.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder<T>
 */

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isObject(bytes) {
    return isMap(bytes)
}

/**
 * Encodes an object with optional fields using integer keys.
 * @param {Map<number, Encodeable> | Record<number, Encodeable>} object A `Map` with integer keys representing the field indices.
 * @returns {number[]}
 */
export function encodeObjectIKey(object) {
    /**
     * @type {[number[], Encodeable][]}
     */
    const entries =
        object instanceof Map
            ? Array.from(object.entries()).map((pair) => [
                  encodeInt(pair[0]),
                  pair[1]
              ])
            : Object.entries(object).map((pair) => [
                  encodeInt(parseInt(pair[0])),
                  pair[1]
              ])

    return encodeDefMap(entries)
}

/**
 * Encodes an object with optional fields using integer keys.
 * @param {Map<string, Encodeable> | Record<string, Encodeable>} object A `Map` with integer keys representing the field indices.
 * @returns {number[]}
 */
export function encodeObjectSKey(object) {
    /**
     * @type {[number[], Encodeable][]}
     */
    const entries =
        object instanceof Map
            ? Array.from(object.entries()).map((pair) => [
                  encodeString(pair[0]),
                  pair[1]
              ])
            : Object.entries(object).map((pair) => [
                  encodeString(pair[0]),
                  pair[1]
              ])

    return encodeDefMap(entries)
}

/**
 * @param {ByteArrayLike} bytes
 * @param {Decoder<number | string>} keyDecoder
 * @param {any} fieldDecoders
 * @returns {any}
 */
function decodeObjectTypeless(bytes, keyDecoder, fieldDecoders) {
    const stream = ByteStream.from(bytes)

    /**
     * @type {any}
     */
    const res = {}

    decodeMap(
        stream,
        () => null,
        (pairStream) => {
            const key = decodeGeneric(pairStream, keyDecoder)

            const decoder = fieldDecoders[key]

            if (!decoder) {
                throw new Error(`unhandled object field ${key}`)
            }

            res[key] = decodeGeneric(pairStream, decoder)
        }
    )

    return res
}

/**
 * Decodes a CBOR encoded object with integer keys.
 * For each field a decoder is called which takes the field index and the field bytes as arguments.
 * @template {{[key: number]: Decoder<any>}} Decoders
 * @param {ByteArrayLike} bytes
 * @param {Decoders} fieldDecoders
 * @returns {{[D in keyof Decoders]+?: Decoders[D] extends Decoder<infer T> ? T : never}}
 */
export function decodeObjectIKey(bytes, fieldDecoders) {
    return decodeObjectTypeless(
        bytes,
        (stream, i) => Number(decodeInt(stream)),
        fieldDecoders
    )
}

/**
 * Decodes a CBOR encoded object with string keys.
 * For each field a decoder is called which takes the field index and the field bytes as arguments.
 * @template {{[key: string]: Decoder<any>}} Decoders
 * @param {ByteArrayLike} bytes
 * @param {Decoders} fieldDecoders
 * @returns {{[D in keyof Decoders]+?: Decoders[D] extends Decoder<infer T> ? T : never}}
 */
export function decodeObjectSKey(bytes, fieldDecoders) {
    return decodeObjectTypeless(bytes, decodeString, fieldDecoders)
}
