import { makeByteStream } from "@helios-lang/codec-utils"
import { decodeDefHead, encodeDefHead, peekMajorType } from "./head.js"

/**
 * @import { BytesLike, IntLike } from "@helios-lang/codec-utils"
 */

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isTag(bytes) {
    return peekMajorType(bytes) == 6
}

/**
 * Unrelated to constructor
 * @param {IntLike} tag
 * @returns {number[]}
 */
export function encodeTag(tag) {
    if (typeof tag == "number") {
        return encodeTag(BigInt(tag))
    } else if (tag < 0) {
        throw new Error("can't encode negative tag")
    }

    return encodeDefHead(6, tag)
}

/**
 * @param {BytesLike} bytes
 * @returns {bigint}
 */
export function decodeTag(bytes) {
    const stream = makeByteStream(bytes)

    const [m, n] = decodeDefHead(stream)

    if (m != 6) {
        throw new Error("unexpected")
    }

    return n
}

/**
 * @param {BytesLike} bytes
 * @returns {bigint}
 */
export function peekTag(bytes) {
    const streamCopy = makeByteStream(bytes).copy()

    return decodeTag(streamCopy)
}
