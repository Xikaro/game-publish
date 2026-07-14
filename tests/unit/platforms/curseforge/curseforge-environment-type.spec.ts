import { CurseForgeEnvironmentType } from "@/platforms/curseforge/curseforge-environment-type";
import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";

describe("CurseForgeEnvironmentType", () => {
    describe("toLoaderEnvironmentType", () => {
        test("returns corresponding LoaderEnvironmentType", () => {
            expect(CurseForgeEnvironmentType.toLoaderEnvironmentType(CurseForgeEnvironmentType.CLIENT)).toBe(LoaderEnvironmentType.CLIENT);
            expect(CurseForgeEnvironmentType.toLoaderEnvironmentType(CurseForgeEnvironmentType.SERVER)).toBe(LoaderEnvironmentType.SERVER);
        });

        test("returns UNKNOWN for unknown values", () => {
            expect(CurseForgeEnvironmentType.toLoaderEnvironmentType(undefined)).toBe(LoaderEnvironmentType.UNKNOWN);
            expect(CurseForgeEnvironmentType.toLoaderEnvironmentType("" as CurseForgeEnvironmentType)).toBe(LoaderEnvironmentType.UNKNOWN);
        });
    });

    describe("fromLoaderEnvironmentType", () => {
        test("converts LoaderEnvironmentType to CurseForgeEnvironmentType", () => {
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.UNKNOWN)).toEqual([]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT)).toEqual([CurseForgeEnvironmentType.CLIENT]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER)).toEqual([CurseForgeEnvironmentType.CLIENT]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER)).toEqual([CurseForgeEnvironmentType.SERVER]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER)).toEqual([CurseForgeEnvironmentType.SERVER]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.BOTH)).toEqual([CurseForgeEnvironmentType.CLIENT, CurseForgeEnvironmentType.SERVER]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ANY)).toEqual([CurseForgeEnvironmentType.CLIENT, CurseForgeEnvironmentType.SERVER]);
        });

        test("returns an empty array for unknown values", () => {
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(undefined)).toEqual([]);
            expect(CurseForgeEnvironmentType.fromLoaderEnvironmentType(1024 as LoaderEnvironmentType)).toEqual([]);
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of CurseForgeEnvironmentType.values()) {
                expect(CurseForgeEnvironmentType.parse(CurseForgeEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of CurseForgeEnvironmentType.values()) {
                expect(CurseForgeEnvironmentType.parse(CurseForgeEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of CurseForgeEnvironmentType.values()) {
                expect(CurseForgeEnvironmentType.parse(CurseForgeEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of CurseForgeEnvironmentType.values()) {
                expect(CurseForgeEnvironmentType.parse(CurseForgeEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
