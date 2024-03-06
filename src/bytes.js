import { ByteStream } from "@helios-lang/codec-utils"
import { decodeHead, encodeHead, encodeIndefHead } from "./head.js"
import { decodeList, isDefList } from "./list.js"

/**
 * @param {number[] | ByteStream} bytes
 * @returns {boolean}
 */
export function isDefBytes(bytes) {
    const stream = ByteStream.from(bytes)

    const [m, _] = decodeHead(stream.copy())

    return m == 2
}

/**
 * @param {number[] | ByteStream} bytes
 * @returns {boolean}
 */
export function isIndefBytes(bytes) {
    const stream = ByteStream.from(bytes)

    return 2 * 32 + 31 == stream.peekOne()
}

/**
 * @param {number[] | ByteStream} bytes
 * @returns {boolean}
 */
export function isBytes(bytes) {
    return isDefBytes(bytes) || isIndefBytes(bytes)
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
        const head = encodeHead(2, BigInt(bytes.length))
        return head.concat(bytes)
    } else {
        let res = encodeIndefHead(2)

        while (bytes.length > 0) {
            const chunk = bytes.splice(0, 64)

            res = res.concat(encodeHead(2, BigInt(chunk.length))).concat(chunk)
        }

        res.push(255)

        return res
    }
}

/**
 * Unwraps a CBOR encoded list of bytes
 * @param {number[] | ByteStream} bytes - cborbytes, mutated to form remaining
 * @returns {number[]} - byteArray
 */
export function decodeBytes(bytes) {
    const stream = ByteStream.from(bytes)

    if (isIndefBytes(bytes)) {
        // multiple chunks
        void stream.shiftOne()

        /**
         * @type {number[]}
         */
        let res = []

        while (stream.peekOne() != 255) {
            const [_, n] = decodeHead(stream)
            if (n > 64n) {
                throw new Error("bytearray chunk too large")
            }

            res = res.concat(stream.shiftMany(Number(n)))
        }

        if (stream.shiftOne() != 255) {
            throw new Error("unexpected")
        }

        return res
    } else {
        const [_, n] = decodeHead(stream)

        return stream.shiftMany(Number(n))
    }
}
