import { ByteStream } from "@helios-lang/codec-utils"
import { None } from "@helios-lang/type-utils"
import { encodeGeneric } from "./generic.js"
import {
    decodeDefHead,
    encodeDefHead,
    encodeIndefHead,
    peekMajorType
} from "./head.js"

/**
 * @typedef {import("@helios-lang/codec-utils").ByteArrayLike} ByteArrayLike
 */

/**
 * @template T
 * @typedef {import("./generic.js").Decodeable<T>} Decodeable<T>
 */

/**
 * @template T
 * @typedef {import("./generic.js").Decoder<T>} Decoder<T>
 */

/**
 * @typedef {import("./generic.js").Encodeable} Encodeable
 */

/**
 * @template T
 * @typedef {(stream: ByteStream, index: number) => T} IndexedDecoder<T>
 */

/**
 * @template T
 * @param {IndexedDecoder<T> | Decodeable<T>} decoder
 * @returns {IndexedDecoder<T>}
 */
function getIndexedDecoder(decoder) {
    if (decoder && "fromCbor" in decoder) {
        /**
         * @type {(stream: ByteStream, i: number) => T}
         */
        return (stream, i) => {
            return decoder.fromCbor(stream)
        }
    } else {
        return decoder
    }
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isIndefList(bytes) {
    const stream = ByteStream.from(bytes)

    if (stream.isAtEnd()) {
        throw new Error("empty cbor bytes")
    }

    return 4 * 32 + 31 == stream.peekOne()
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isDefList(bytes) {
    const stream = ByteStream.from(bytes)

    return peekMajorType(stream) == 4 && stream.peekOne() != 4 * 32 + 31
}

/**
 * @param {ByteArrayLike} bytes
 * @returns {boolean}
 */
export function isList(bytes) {
    return peekMajorType(bytes) == 4
}

/**
 * @returns {number[]}
 */
function encodeIndefListStart() {
    return encodeIndefHead(4)
}

/**
 * @param {Encodeable[]} list
 * @returns {number[]}
 */
function encodeListInternal(list) {
    /**
     * @type {number[]}
     */
    let res = []
    for (let item of list) {
        res = res.concat(encodeGeneric(item))
    }

    return res
}

/**
 * @returns {number[]}
 */
function encodeIndefListEnd() {
    return [255]
}

/**
 * This follows the serialization format that the Haskell input-output-hk/plutus UPLC evaluator (i.e. empty lists use `encodeDefList`, non-empty lists use `encodeIndefList`).
 * See [well-typed/cborg/serialise/src/Codec/Serialise/Class.hs](https://github.com/well-typed/cborg/blob/4bdc818a1f0b35f38bc118a87944630043b58384/serialise/src/Codec/Serialise/Class.hs#L181).
 * @param {Encodeable[]} items already encoded
 * @returns {number[]}
 */
export function encodeList(items) {
    return items.length > 0 ? encodeIndefList(items) : encodeDefList(items)
}

/**
 * Encodes a list of CBOR encodeable items using CBOR indefinite length encoding.
 * @param {Encodeable[]} list Each item is either already serialized, or a CborData instance with a toCbor() method.
 * @returns {number[]}
 */
export function encodeIndefList(list) {
    return encodeIndefListStart()
        .concat(encodeListInternal(list))
        .concat(encodeIndefListEnd())
}

/**
 * @param {bigint} n
 * @returns {number[]}
 */
function encodeDefListStart(n) {
    return encodeDefHead(4, n)
}

/**
 * Encodes a list of CBOR encodeable items using CBOR definite length encoding
 * (i.e. header bytes of the element represent the length of the list).
 * @param {Encodeable[]} items Each item is already serialized
 * @returns {number[]}
 */
export function encodeDefList(items) {
    return encodeDefListStart(BigInt(items.length)).concat(
        encodeListInternal(items)
    )
}

/**
 * Decodes a CBOR encoded list.
 * A decoder function is called with the bytes of every contained item (nothing is returning directly).
 * @template T
 * @param {ByteArrayLike} bytes
 * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
 * @returns {T[]}
 */
export function decodeList(bytes, itemDecoder) {
    const stream = ByteStream.from(bytes)

    const itemDecoder_ = getIndexedDecoder(itemDecoder)

    /**
     * @type {T[]}
     */
    const res = []

    if (isIndefList(stream)) {
        void stream.shiftOne()

        let i = 0
        while (stream.peekOne() != 255) {
            res.push(itemDecoder_(stream, i))
            i++
        }

        if (stream.shiftOne() != 255) {
            throw new Error("invalid indef list termination byte")
        }
    } else {
        const [m, n] = decodeDefHead(stream)

        if (m != 4) {
            throw new Error("invalid def list head byte")
        }

        for (let i = 0; i < Number(n); i++) {
            res.push(itemDecoder_(stream, i))
        }
    }

    return res
}

/**
 * @param {ByteArrayLike} bytes
 */
export function decodeListLazy(bytes) {
    const stream = ByteStream.from(bytes)

    if (isIndefList(stream)) {
        void stream.shiftOne()

        let i = 0
        let done = false

        if (stream.peekOne() == 255) {
            stream.shiftOne()
            done = true
        }

        /**
         * @template T
         * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
         * @returns {T}
         */
        function decodeItem(itemDecoder) {
            if (done) {
                throw new Error("end-of-list")
            }

            const itemDecoder_ = getIndexedDecoder(itemDecoder)

            const res = itemDecoder_(stream, i)

            i++

            if (stream.peekOne() == 255) {
                stream.shiftOne()
                done = true
            }

            return res
        }

        return decodeItem
    } else {
        const [m, n] = decodeDefHead(stream)

        if (m != 4) {
            throw new Error("unexpected")
        }

        let i = 0

        /**
         * @template T
         * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
         * @returns {T}
         */
        function decodeItem(itemDecoder) {
            if (i >= n) {
                throw new Error("end-of-list")
            }

            const itemDecoder_ = getIndexedDecoder(itemDecoder)

            const res = itemDecoder_(stream, i)

            i++

            return res
        }

        return decodeItem
    }
}

/**
 * @param {ByteArrayLike} bytes
 */
export function decodeListLazyOption(bytes) {
    const stream = ByteStream.from(bytes)

    if (isIndefList(stream)) {
        void stream.shiftOne()

        let i = 0
        let done = false

        if (stream.peekOne() == 255) {
            stream.shiftOne()
            done = true
        }

        /**
         * @template T
         * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
         * @returns {Option<T>}
         */
        function decodeItem(itemDecoder) {
            if (done) {
                return None
            }

            const itemDecoder_ = getIndexedDecoder(itemDecoder)

            const res = itemDecoder_(stream, i)

            i++

            if (stream.peekOne() == 255) {
                stream.shiftOne()
                done = true
            }

            return res
        }

        return decodeItem
    } else {
        const [m, n] = decodeDefHead(stream)

        if (m != 4) {
            throw new Error("unexpected")
        }

        let i = 0

        /**
         * @template T
         * @param {IndexedDecoder<T> | Decodeable<T>} itemDecoder
         * @returns {Option<T>}
         */
        function decodeItem(itemDecoder) {
            if (i >= n) {
                return None
            }

            const itemDecoder_ = getIndexedDecoder(itemDecoder)

            const res = itemDecoder_(stream, i)

            i++

            return res
        }

        return decodeItem
    }
}
