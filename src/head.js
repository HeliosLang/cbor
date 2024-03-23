import { encodeIntBE, decodeIntBE, ByteStream } from "@helios-lang/codec-utils"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

/**
 * @param {number} m - major type
 * @param {bigint | number} n - size parameter
 * @returns {number[]} - uint8 bytes
 */
export function encodeHead(m, n) {
    if (n <= 23n) {
        return [32 * m + Number(n)]
    } else if (n >= 24n && n <= 255n) {
        return [32 * m + 24, Number(n)]
    } else if (n >= 256n && n <= 256n * 256n - 1n) {
        return [
            32 * m + 25,
            Number((BigInt(n) / 256n) % 256n),
            Number(BigInt(n) % 256n)
        ]
    } else if (n >= 256n * 256n && n <= 256n * 256n * 256n * 256n - 1n) {
        const e4 = encodeIntBE(n)

        while (e4.length < 4) {
            e4.unshift(0)
        }
        return [32 * m + 26].concat(e4)
    } else if (
        n >= 256n * 256n * 256n * 256n &&
        n <= 256n * 256n * 256n * 256n * 256n * 256n * 256n * 256n - 1n
    ) {
        const e8 = encodeIntBE(n)

        while (e8.length < 8) {
            e8.unshift(0)
        }
        return [32 * m + 27].concat(e8)
    } else {
        throw new Error("n out of range")
    }
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {[number, bigint]} - [majorType, n]
 */
export function decodeHead(bytes) {
    const stream = ByteStream.from(bytes)

    if (stream.isAtEnd()) {
        throw new Error("empty cbor head")
    }

    const first = stream.shiftOne()

    const m = Math.trunc(first / 32)

    if (first % 32 <= 23) {
        return [m, BigInt(first % 32)]
    } else if (first % 32 == 24) {
        return [m, decodeIntBE(stream.shiftMany(1))]
    } else if (first % 32 == 25) {
        if (m == 7) {
            throw new Error("decode Float16 by calling decodeFloat16 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(2))]
        }
    } else if (first % 32 == 26) {
        if (m == 7) {
            throw new Error("decode Float32 by calling decodeFloat32 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(4))]
        }
    } else if (first % 32 == 27) {
        if (m == 7) {
            throw new Error("decode Float64 by calling decodeFloat64 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(8))]
        }
    } else if (
        (m == 2 || m == 3 || m == 4 || m == 5 || m == 7) &&
        first % 32 == 31
    ) {
        return [m, 31n] // n=31 is used an indefinite length marker for 2,3,4,5,7 (never for 0,1,6)
    } else {
        throw new Error("bad header")
    }
}

/**
 * @param {number} m
 * @returns {number[]}
 */
export function encodeIndefHead(m) {
    return [32 * m + 31]
}

/**
 * @param {ByteArrayLike} bytes - cbor bytes
 * @returns {number} - majorType
 */
export function decodeIndefHead(bytes) {
    const stream = ByteStream.from(bytes)

    const first = stream.shiftOne()

    const m = Math.trunc((first - 31) / 32)

    return m
}
