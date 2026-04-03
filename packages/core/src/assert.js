/**
 * @type {!Array<string>}
 */
const ERROR_MESSAGES = [
    'array element type must be a number typedef',
    'config field must be a number',
]

const ERR_ARRAY_ELEMENT_MUST_BE_NUMBER = 0;
const ERR_CONFIG_FIELD_MUST_BE_NUMBER = 1;

/**
 * @throws
 * @template T
 * @param {any} value
 * @param {(v: any) => v is T} predicate
 * @param {number} errorId
 * @returns {asserts value is T}
 */
function assert(value, predicate, errorId) {
    if (!predicate(value)) {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

/**
 * @throws
 * @param {any} value
 * @param {number} errorId
 * @returns {asserts value is number}
 */
function assertIsNumber(value, errorId) {
    if (typeof value !== 'number') {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

/**
 * @throws
 * @param {any} value
 * @param {number} errorId
 * @returns {asserts value is number}
 */
function assertIsObject(value, errorId) {
    if (value === null || typeof value !== 'object') {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

export {
    ERROR_MESSAGES,
    ERR_ARRAY_ELEMENT_MUST_BE_NUMBER,
    ERR_CONFIG_FIELD_MUST_BE_NUMBER,
    assert,
    assertIsNumber,
    assertIsObject
}
