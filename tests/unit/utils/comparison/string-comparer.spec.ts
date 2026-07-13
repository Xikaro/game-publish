import { ORDINAL_COMPARER, IGNORE_CASE_COMPARER, IGNORE_NON_WORD_CHARACTERS_COMPARER, IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER } from "@/utils/comparison/string-comparer";

describe("ORDINAL_COMPARER", () => {
    test("compares two strings using case-sensitive ordinal comparison", () => {
        expect(ORDINAL_COMPARER("test", "test")).toBe(0);
        expect(ORDINAL_COMPARER("Test", "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER("test", "Test")).toBeGreaterThan(0);
        expect(ORDINAL_COMPARER("test", "testing")).toBeLessThan(0);
        expect(ORDINAL_COMPARER("testing", "test")).toBeGreaterThan(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(ORDINAL_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER(undefined, null)).toBeLessThan(0);
        expect(ORDINAL_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(ORDINAL_COMPARER(null, "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(ORDINAL_COMPARER(null, null)).toBe(0);
    });
});

describe("IGNORE_CASE_COMPARER", () => {
    test("compares two strings using case-insensitive ordinal comparison", () => {
        expect(IGNORE_CASE_COMPARER("A", "a")).toBe(0);
        expect(IGNORE_CASE_COMPARER("a", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("A", "b")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("A", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("B", "a")).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER("b", "A")).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER("B", "A")).toBeGreaterThan(0);
    });

    test("ignores case differences when comparing strings", () => {
        expect(IGNORE_CASE_COMPARER("test", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("Test", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("TEST", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("test", "TEST")).toBe(0);
        expect(IGNORE_CASE_COMPARER("Test", "TEST")).toBe(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(IGNORE_CASE_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(undefined, null)).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(IGNORE_CASE_COMPARER(null, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER(null, null)).toBe(0);
    });
});

describe("IGNORE_NON_WORD_CHARACTERS_COMPARER", () => {
    test("compares two strings using case-sensitive ordinal comparison", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test", "test")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("Test", "test")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test", "Test")).toBeGreaterThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test", "testing")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("testing", "test")).toBeGreaterThan(0);
    });

    test("ignores non-word characters when comparing strings", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test---1", "test1")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test1", "test---1")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("--test1", "test---1")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("test1", "--test-1---")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("t-e-s-t-1-", "--test_1---")).toBe(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("|Test", "test")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("-test", "Test")).toBeGreaterThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("|test", "testing")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER("-testing", "test")).toBeGreaterThan(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(undefined, null)).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(null, "test")).toBeLessThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(IGNORE_NON_WORD_CHARACTERS_COMPARER(null, null)).toBe(0);
    });
});

describe("IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER", () => {
    test("compares two strings using case-insensitive ordinal comparison", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("A", "a")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("a", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("A", "b")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("A", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("B", "a")).toBeGreaterThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("b", "A")).toBeGreaterThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("B", "A")).toBeGreaterThan(0);
    });

    test("ignores case differences when comparing strings", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("test", "test")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("Test", "test")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("TEST", "test")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("test", "TEST")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("Test", "TEST")).toBe(0);
    });

    test("ignores non-word characters when comparing strings", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("test---1", "Test1")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("test1", "TEST---1")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("--tEst1", "test---1")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("test1", "--test-1---")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("t-e-s-t-1-", "--test_1---")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("|Test", "test")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("-test", "Test")).toBe(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("|test", "testing")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER("-testing", "test")).toBeGreaterThan(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(undefined, null)).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(null, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_COMPARER(null, null)).toBe(0);
    });
});
