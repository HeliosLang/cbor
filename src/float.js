import {
    decodeFloat16 as decodeFloat16_IEEE754,
    decodeFloat32 as decodeFloat32_IEEE754,
    decodeFloat64 as decodeFloat64_IEEE754,
    encodeFloat16 as encodeFloat16_IEEE754,
    encodeFloat32 as encodeFloat32_IEEE754,
    encodeFloat64 as encodeFloat64_IEEE754,
    makeByteStream
} from "@helios-lang/codec-utils"

/**
 * @typedef {import("@helios-lang/codec-utils").BytesLike} BytesLike
 */

const FLOAT16_HEAD = 249
const FLOAT32_HEAD = 250
const FLOAT64_HEAD = 251

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isFloat16(bytes) {
    const stream = makeByteStream({ bytes })
    return stream.peekOne() == FLOAT16_HEAD
}

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isFloat32(bytes) {
    const stream = makeByteStream({ bytes })
    return stream.peekOne() == FLOAT32_HEAD
}

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isFloat64(bytes) {
    const stream = makeByteStream({ bytes })
    return stream.peekOne() == FLOAT64_HEAD
}

/**
 * @param {BytesLike} bytes
 * @returns {boolean}
 */
export function isFloat(bytes) {
    const stream = makeByteStream({ bytes })
    const head = stream.peekOne()
    return head == FLOAT16_HEAD || head == FLOAT32_HEAD || head == FLOAT64_HEAD
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
export function decodeFloat16(bytes) {
    const stream = makeByteStream({ bytes })

    const head = stream.shiftOne()

    if (head != FLOAT16_HEAD) {
        throw new Error("invalid Float16 header")
    }

    return decodeFloat16_IEEE754(stream.shiftMany(2))
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
export function decodeFloat32(bytes) {
    const stream = makeByteStream({ bytes })

    const head = stream.shiftOne()

    if (head != FLOAT32_HEAD) {
        throw new Error("invalid Float32 header")
    }

    return decodeFloat32_IEEE754(stream.shiftMany(4))
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
export function decodeFloat64(bytes) {
    const stream = makeByteStream({ bytes })

    const head = stream.shiftOne()

    if (head != FLOAT64_HEAD) {
        throw new Error("invalid Float64 header")
    }

    return decodeFloat64_IEEE754(stream.shiftMany(8))
}

/**
 * @param {BytesLike} bytes
 * @returns {number}
 */
export function decodeFloat(bytes) {
    const stream = makeByteStream({ bytes })

    const head = stream.shiftOne()

    switch (head) {
        case FLOAT16_HEAD:
            return decodeFloat16_IEEE754(stream.shiftMany(2))
        case FLOAT32_HEAD:
            return decodeFloat32_IEEE754(stream.shiftMany(4))
        case FLOAT64_HEAD:
            return decodeFloat64_IEEE754(stream.shiftMany(8))
        default:
            throw new Error("invalid float header")
    }
}

/**
 * @param {number} f
 * @returns {number[]}
 */
export function encodeFloat16(f) {
    return [FLOAT16_HEAD].concat(encodeFloat16_IEEE754(f))
}

/**
 * @param {number} f
 * @returns {number[]}
 */
export function encodeFloat32(f) {
    return [FLOAT32_HEAD].concat(encodeFloat32_IEEE754(f))
}

/**
 * @param {number} f
 * @returns {number[]}
 */
export function encodeFloat64(f) {
    return [FLOAT64_HEAD].concat(encodeFloat64_IEEE754(f))
}
