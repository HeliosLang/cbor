import { ByteStream } from "@helios-lang/codec-utils"
import { decodeHead, encodeHead } from "./head.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

/**
 * Unrelated to constructor
 * @param {bigint | number} tag
 * @returns {number[]}
 */
export function encodeTag(tag) {
    if (typeof tag == "number") {
        return encodeTag(BigInt(tag))
    } else if (tag < 0) {
        throw new Error("can't encode negative tag")
    }

    return encodeHead(6, tag)
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {bigint}
 */
export function decodeTag(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeHead(stream)

    if (m != 6) {
        throw new Error("unexpected")
    }

    return n
}
