export { decodeBool, encodeBool, isBool } from "./bool.js"
export {
    decodeBytes,
    encodeBytes,
    isBytes,
    isDefBytes,
    isIndefBytes
} from "./bytes.js"
export {
    decodeConstr,
    decodeConstrLazy,
    encodeConstr,
    isConstr
} from "./constr.js"
export {
    decodeFloat,
    decodeFloat16,
    decodeFloat32,
    decodeFloat64,
    encodeFloat16,
    encodeFloat32,
    encodeFloat64,
    isFloat,
    isFloat16,
    isFloat32,
    isFloat64
} from "./float.js"
export { decodeInt, encodeInt, isInt } from "./int.js"
export {
    decodeList,
    decodeListLazy,
    encodeList,
    encodeDefList,
    encodeIndefList,
    isList
} from "./list.js"
export { decodeMap, encodeMap, isMap } from "./map.js"
export { decodeNull, encodeNull, isNull } from "./null.js"
export {
    decodeObjectIKey,
    decodeObjectSKey,
    encodeObjectIKey,
    encodeObjectSKey,
    isObject
} from "./object.js"
export {
    decodeListOption,
    decodeNullOption,
    encodeListOption,
    encodeNullOption
} from "./option.js"
export { decodeSet, encodeSet } from "./set.js"
export { decodeString, encodeString, isString } from "./string.js"
export { decodeTag, encodeTag, isTag } from "./tag.js"
export { decodeTagged } from "./tagged.js"
export { decodeTuple, decodeTupleLazy, encodeTuple, isTuple } from "./tuple.js"

/**
 * @import { ByteStream } from "@helios-lang/codec-utils"
 */

/**
 * @template T
 * @typedef {{fromCbor: (stream: ByteStream) => T}} Decodeable
 */

/**
 * @template T
 * @typedef {((stream: ByteStream) => T) | Decodeable<T>} Decoder<T>
 */

/**
 * @typedef {number[] | {toCbor: () => number[]}} Encodeable
 */

/**
 * @template T
 * @typedef {(stream: ByteStream, index: number) => T} IndexedDecoder
 */
