import { encodeIntBE, decodeIntBE, ByteStream } from "@helios-lang/codec-utils"
import { decodeBytes, encodeBytes } from "./bytes.js"
import { decodeDefHead, encodeDefHead } from "./head.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 * @typedef {import("@helios-lang/codec-utils").IntLike} IntLike
 */

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isInt(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeDefHead(stream)

    if (m == 0 || m == 1) {
        return true
    } else if (m == 6) {
        return n == 2n || n == 3n
    } else {
        return false
    }
}

/**
 * Encodes a bigint integer using CBOR.
 * @param {IntLike} n
 * @returns {number[]}
 */
export function encodeInt(n) {
    if (typeof n == "number") {
        return encodeInt(BigInt(n))
    } else if (n >= 0n && n <= (2n << 63n) - 1n) {
        return encodeDefHead(0, n)
    } else if (n >= 2n << 63n) {
        return encodeDefHead(6, 2).concat(encodeBytes(encodeIntBE(n)))
    } else if (n <= -1n && n >= -(2n << 63n)) {
        return encodeDefHead(1, -n - 1n)
    } else {
        return encodeDefHead(6, 3).concat(encodeBytes(encodeIntBE(-n - 1n)))
    }
}

/**
 * Decodes a CBOR encoded bigint integer.
 * @param {ByteArrayLike} bytes
 * @returns {bigint}
 */
export function decodeInt(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, n] = decodeDefHead(stream)

    if (m == 0) {
        return n
    } else if (m == 1) {
        return -n - 1n
    } else if (m == 6) {
        if (n == 2n) {
            const b = decodeBytes(stream)

            return decodeIntBE(b)
        } else if (n == 3n) {
            const b = decodeBytes(stream)

            return -decodeIntBE(b) - 1n
        } else {
            throw new Error(`unexpected tag n:${n}`)
        }
    } else {
        throw new Error(`unexpected tag m:${m}`)
    }
}
