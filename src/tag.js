import { ByteStream } from "@helios-lang/codec-utils"
import { decodeDefHead, encodeDefHead } from "./head.js"

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 * @typedef {import("@helios-lang/codec-utils").IntLike} IntLike
 */

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
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeDefHead(stream)

    if (m != 6) {
        throw new Error("unexpected")
    }

    return n
}
