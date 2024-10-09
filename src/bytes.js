import { ByteStream } from "@helios-lang/codec-utils"
import {
    decodeDefHead,
    encodeDefHead,
    encodeIndefHead,
    peekMajorType
} from "./head.js"

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 */

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isDefBytes(bytes) {
    const stream = ByteStream.from(bytes)

    const m = peekMajorType(stream)

    return m == 2 && stream.peekOne() != 2 * 32 + 31
}

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isIndefBytes(bytes) {
    const stream = ByteStream.from(bytes)

    return 2 * 32 + 31 == stream.peekOne()
}

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isBytes(bytes) {
    return peekMajorType(bytes) == 2
}

/**
 * Wraps a list of bytes using CBOR. Optionally splits the bytes into chunks.
 * @example
 * bytesToHex(Cbor.encodeBytes(hexToBytes("4d01000033222220051200120011"))) == "4e4d01000033222220051200120011"
 * @param {number[]} bytes
 * @param {boolean} splitIntoChunks
 * @returns {number[]} - cbor bytes
 */
export function encodeBytes(bytes, splitIntoChunks = false) {
    bytes = bytes.slice()

    if (bytes.length <= 64 || !splitIntoChunks) {
        const head = encodeDefHead(2, BigInt(bytes.length))
        return head.concat(bytes)
    } else {
        let res = encodeIndefHead(2)

        while (bytes.length > 0) {
            const chunk = bytes.splice(0, 64)

            res = res
                .concat(encodeDefHead(2, BigInt(chunk.length)))
                .concat(chunk)
        }

        res.push(255)

        return res
    }
}

/**
 * Unwraps a CBOR encoded list of bytes
 * @param {BytesLike} bytes - cborbytes, mutated to form remaining
 * @returns {number[]} - byteArray
 */
export function decodeBytes(bytes) {
    const stream = ByteStream.from(bytes)

    if (isIndefBytes(bytes)) {
        void stream.shiftOne()

        // multiple chunks

        /**
         * @type {number[]}
         */
        let res = []

        while (stream.peekOne() != 255) {
            const [_, n] = decodeDefHead(stream)
            if (n > 64n) {
                throw new Error("bytearray chunk too large")
            }

            res = res.concat(stream.shiftMany(Number(n)))
        }

        if (stream.shiftOne() != 255) {
            throw new Error("invalid indef bytes termination byte")
        }

        return res
    } else {
        const [m, n] = decodeDefHead(stream)

        if (m != 2) {
            throw new Error("invalid def bytes")
        }

        return stream.shiftMany(Number(n))
    }
}
