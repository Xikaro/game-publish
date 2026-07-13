import { FabricEnvironmentType } from "@/loaders/fabric/fabric-environment-type";
import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";

describe("FabricEnvironmentType", () => {
    describe("toLoaderEnvironmentType", () => {
        test("returns corresponding LoaderEnvironmentType", () => {
            expect(FabricEnvironmentType.toLoaderEnvironmentType(FabricEnvironmentType.CLIENT)).toBe(LoaderEnvironmentType.CLIENT);
            expect(FabricEnvironmentType.toLoaderEnvironmentType(FabricEnvironmentType.SERVER)).toBe(LoaderEnvironmentType.SERVER);
            expect(FabricEnvironmentType.toLoaderEnvironmentType(FabricEnvironmentType.BOTH)).toBe(LoaderEnvironmentType.BOTH);
        });

        test("returns undefined for unknown values", () => {
            expect(FabricEnvironmentType.toLoaderEnvironmentType(undefined)).toBeUndefined();
            expect(FabricEnvironmentType.toLoaderEnvironmentType("" as FabricEnvironmentType)).toBeUndefined();
        });
    });

    describe("fromLoaderEnvironmentType", () => {
        test("converts LoaderEnvironmentType to FabricEnvironmentType", () => {
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT)).toBe(FabricEnvironmentType.CLIENT);
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER)).toBe(FabricEnvironmentType.CLIENT);
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER)).toBe(FabricEnvironmentType.SERVER);
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER)).toBe(FabricEnvironmentType.SERVER);
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.BOTH)).toBe(FabricEnvironmentType.BOTH);
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ANY)).toBe(FabricEnvironmentType.BOTH);
        });

        test("returns undefined for unknown values", () => {
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(undefined)).toBeUndefined();
            expect(FabricEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.UNKNOWN)).toBeUndefined();
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
