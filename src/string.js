import {
    ByteStream,
    decodeUtf8,
    encodeUtf8,
    isValidUtf8
} from "@helios-lang/codec-utils"
import { decodeDefHead, encodeDefHead, peekMajorType } from "./head.js"
import { decodeList, encodeDefList, isDefList } from "./list.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isString(bytes) {
    return peekMajorType(bytes) == 3
}

/**
 * Encodes a Utf8 string into Cbor bytes.
 * Strings can be split into lists with chunks of up to 64 bytes
 * to play nice with Cardano tx metadata constraints.
 * @param {string} str
 * @param {boolean} split
 * @returns {number[]}
 */
export function encodeString(str, split = false) {
    const bytes = encodeUtf8(str)

    if (split && bytes.length > 64) {
        /**
         * @type {number[][]}
         */
        const chunks = []

        let i = 0
        while (i < bytes.length) {
            // We encode the largest chunk up to 64 bytes
            // that is valid UTF-8
            let maxChunkLength = 64
            let chunk
            while (true) {
                chunk = bytes.slice(i, i + maxChunkLength)
                if (isValidUtf8(chunk)) {
                    break
                }
                maxChunkLength--
            }

            chunks.push(encodeDefHead(3, BigInt(chunk.length)).concat(chunk))
            i += chunk.length
        }

        return encodeDefList(chunks)
    } else {
        return encodeDefHead(3, BigInt(bytes.length)).concat(bytes)
    }
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {string}
 */
function decodeStringInternal(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeDefHead(stream)

    if (m !== 3) {
        throw new Error("unexpected")
    }

    return decodeUtf8(stream.shiftMany(Number(n)))
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {string}
 */
export function decodeString(bytes) {
    const stream = ByteStream.from(bytes)

    if (isDefList(stream)) {
        let result = ""

        decodeList(stream, (itemBytes, _) => {
            result += decodeStringInternal(itemBytes)
        })

        return result
    } else {
        return decodeStringInternal(stream)
    }
}
