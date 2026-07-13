import { createDefaultEqualityComparer } from "./equality-comparer";
import { IGNORE_CASE_COMPARER, IGNORE_NON_WORD_CHARACTERS_COMPARER, IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER } from "./string-comparer";

/**
 * A string comparer that performs a case-sensitive ordinal string comparison.
 */
export const ORDINAL_EQUALITY_COMPARER = createDefaultEqualityComparer<string>();

/**
 * A string comparer that ignores case differences.
 */
export const IGNORE_CASE_EQUALITY_COMPARER = IGNORE_CASE_COMPARER.asEqualityComparer();

/**
 * An equality comparer that compares two strings while ignoring non-word characters (e.g., spaces, punctuation).
 */
export const IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER = IGNORE_NON_WORD_CHARACTERS_COMPARER.asEqualityComparer();

/**
 * An equality comparer that compares two strings while ignoring non-word characters (e.g., spaces, punctuation) and case differences.
 */
export const IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER = IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER.asEqualityComparer();
