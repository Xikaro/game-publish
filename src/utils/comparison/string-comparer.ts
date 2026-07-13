import { stringCompare } from "@/utils/string-utils";
import { createComparer, createBaseComparer, createDefaultComparer } from "./comparer";

/**
 * A regular expression that matches a string consisting of a single character that is neither a letter nor a digit.
 */
const IS_NOT_LETTER_OR_DIGIT_REGEX = /^[^\p{L}\d]$/u;

/**
 * A string comparer that performs a case-sensitive ordinal string comparison.
 */
export const ORDINAL_COMPARER = createDefaultComparer<string>();

/**
 * A string comparer that ignores case differences.
 */
export const IGNORE_CASE_COMPARER = createBaseComparer<string>().thenBy(
    (left, right) => left?.localeCompare(right, undefined, { sensitivity: "accent" }) ?? 0
);

/**
 * A string comparer that ignores non-word characters (e.g., spaces, punctuation).
 */
export const IGNORE_NON_WORD_CHARACTERS_COMPARER = createComparer<string>(
    (x, y) => stringCompare(x, y, { ignoredCharacters: IS_NOT_LETTER_OR_DIGIT_REGEX, ignoreCase: false })
);

/**
 * A string comparer that ignores non-word characters (e.g., spaces, punctuation) and case differences.
 */
export const IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER = createComparer<string>(
    (x, y) => stringCompare(x, y, { ignoredCharacters: IS_NOT_LETTER_OR_DIGIT_REGEX, ignoreCase: true })
);
