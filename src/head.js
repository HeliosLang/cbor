import {
    decodeIntBE,
    encodeIntBE,
    makeByteStream
} from "@helios-lang/codec-utils"

/**
 * @import { BytesLike, IntLike } from "@helios-lang/codec-utils"
 */

/**
 * @param {number} m - major type
 * @param {IntLike} n - size parameter
 * @returns {number[]} - uint8 bytes
 */
export function encodeDefHead(m, n) {
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
 * @param {number} b0
 * @returns {[number, number]}
 */
function decodeFirstHeadByte(b0) {
    const m = Math.trunc(b0 / 32)
    const n0 = b0 % 32

    return [m, n0]
}

/**
 * @param {BytesLike} bytes
 * @returns {[number, bigint]} - [majorType, n]
 */
export function decodeDefHead(bytes) {
    const stream = makeByteStream(bytes)

    if (stream.isAtEnd()) {
        throw new Error("empty cbor head")
    }

    const first = stream.shiftOne()

    const [m, n0] = decodeFirstHeadByte(first)

    if (n0 <= 23) {
        return [m, BigInt(n0)]
    } else if (n0 == 24) {
        return [m, decodeIntBE(stream.shiftMany(1))]
    } else if (n0 == 25) {
        if (m == 7) {
            throw new Error("decode Float16 by calling decodeFloat16 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(2))]
        }
    } else if (n0 == 26) {
        if (m == 7) {
            throw new Error("decode Float32 by calling decodeFloat32 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(4))]
        }
    } else if (n0 == 27) {
        if (m == 7) {
            throw new Error("decode Float64 by calling decodeFloat64 directly")
        } else {
            return [m, decodeIntBE(stream.shiftMany(8))]
        }
    } else if ((m == 2 || m == 3 || m == 4 || m == 5 || m == 7) && n0 == 31) {
        // head value 31 is used an indefinite length marker for 2,3,4,5,7 (never for 0,1,6)
        throw new Error(
            "unexpected header header (expected def instead of indef)"
        )
    } else {
        throw new Error("bad header")
    }
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
export function peekMajorType(bytes) {
    const stream = makeByteStream(bytes)

    return Math.trunc(stream.peekOne() / 32)
}

/**
 * @param {BytesLike} bytes
 * @returns {[number, number]}
 */
export function peekMajorAndSimpleMinorType(bytes) {
    const stream = makeByteStream(bytes)

    const first = stream.peekOne()

    return decodeFirstHeadByte(first)
}

/**
 * @param {number} m
 * @returns {number[]}
 */
export function encodeIndefHead(m) {
    return [32 * m + 31]
}
