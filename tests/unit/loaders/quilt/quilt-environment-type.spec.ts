import { QuiltEnvironmentType } from "@/loaders/quilt/quilt-environment-type";
import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";

describe("QuiltEnvironmentType", () => {
    describe("toLoaderEnvironmentType", () => {
        test("returns corresponding LoaderEnvironmentType", () => {
            expect(QuiltEnvironmentType.toLoaderEnvironmentType(QuiltEnvironmentType.CLIENT)).toBe(LoaderEnvironmentType.CLIENT);
            expect(QuiltEnvironmentType.toLoaderEnvironmentType(QuiltEnvironmentType.DEDICATED_SERVER)).toBe(LoaderEnvironmentType.SERVER);
            expect(QuiltEnvironmentType.toLoaderEnvironmentType(QuiltEnvironmentType.ALL)).toBe(LoaderEnvironmentType.ALL);
        });

        test("returns undefined for unknown values", () => {
            expect(QuiltEnvironmentType.toLoaderEnvironmentType(undefined)).toBeUndefined();
            expect(QuiltEnvironmentType.toLoaderEnvironmentType("" as QuiltEnvironmentType)).toBeUndefined();
        });
    });

    describe("fromLoaderEnvironmentType", () => {
        test("converts LoaderEnvironmentType to QuiltEnvironmentType", () => {
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT)).toBe(QuiltEnvironmentType.CLIENT);
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER)).toBe(QuiltEnvironmentType.CLIENT);
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER)).toBe(QuiltEnvironmentType.DEDICATED_SERVER);
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER)).toBe(QuiltEnvironmentType.DEDICATED_SERVER);
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ALL)).toBe(QuiltEnvironmentType.ALL);
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ANY)).toBe(QuiltEnvironmentType.ALL);
        });

        test("returns undefined for unknown values", () => {
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(undefined)).toBeUndefined();
            expect(QuiltEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.UNKNOWN)).toBeUndefined();
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
