import { ModrinthEnvironmentType } from "@/platforms/modrinth/modrinth-environment-type";
import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";

describe("ModrinthEnvironmentType", () => {
    describe("toLoaderEnvironmentType", () => {
        test("returns corresponding LoaderEnvironmentType", () => {
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.UNKNOWN)).toBe(LoaderEnvironmentType.UNKNOWN);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.CLIENT_AND_SERVER)).toBe(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.CLIENT_ONLY)).toBe(LoaderEnvironmentType.CLIENT_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL)).toBe(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_OPTIONAL);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.SINGLEPLAYER_ONLY)).toBe(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.SERVER_ONLY)).toBe(LoaderEnvironmentType.SERVER_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL)).toBe(LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.DEDICATED_SERVER_ONLY)).toBe(LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.CLIENT_OR_SERVER)).toBe(LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_OPTIONAL);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(ModrinthEnvironmentType.CLIENT_OR_SERVER_PREFERS_BOTH)).toBe(LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SERVER_PREFERRED);
        });

        test("returns UNKNOWN for unknown values", () => {
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType(undefined)).toBe(LoaderEnvironmentType.UNKNOWN);
            expect(ModrinthEnvironmentType.toLoaderEnvironmentType("" as ModrinthEnvironmentType)).toBe(LoaderEnvironmentType.UNKNOWN);
        });
    });

    describe("fromLoaderEnvironmentType", () => {
        test("converts LoaderEnvironmentType to ModrinthEnvironmentType", () => {
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.UNKNOWN)).toBe(ModrinthEnvironmentType.UNKNOWN);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_REQUIRED)).toBe(ModrinthEnvironmentType.CLIENT_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_OPTIONAL)).toBe(ModrinthEnvironmentType.CLIENT_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_PREFERRED)).toBe(ModrinthEnvironmentType.CLIENT_ONLY);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(ModrinthEnvironmentType.SERVER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SERVER_PREFERRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.DEDICATED_SERVER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER_OPTIONAL)).toBe(ModrinthEnvironmentType.DEDICATED_SERVER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.DEDICATED_SERVER_PREFERRED)).toBe(ModrinthEnvironmentType.DEDICATED_SERVER_ONLY);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED)).toBe(ModrinthEnvironmentType.SINGLEPLAYER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_OPTIONAL)).toBe(ModrinthEnvironmentType.SINGLEPLAYER_ONLY);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_PREFERRED)).toBe(ModrinthEnvironmentType.SINGLEPLAYER_ONLY);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ALL)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.BOTH)).toBe(ModrinthEnvironmentType.CLIENT_AND_SERVER);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_PREFERRED)).toBe(ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED | LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED | LoaderEnvironmentType.SERVER_PREFERRED)).toBe(ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL);

            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(ModrinthEnvironmentType.CLIENT_OR_SERVER);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SERVER_PREFERRED)).toBe(ModrinthEnvironmentType.CLIENT_OR_SERVER_PREFERS_BOTH);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(LoaderEnvironmentType.ANY)).toBe(ModrinthEnvironmentType.CLIENT_OR_SERVER_PREFERS_BOTH);
        });

        test("returns UNKNOWN for unknown values", () => {
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(undefined)).toBe(ModrinthEnvironmentType.UNKNOWN);
            expect(ModrinthEnvironmentType.fromLoaderEnvironmentType(1024 as LoaderEnvironmentType)).toBe(ModrinthEnvironmentType.UNKNOWN);
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of ModrinthEnvironmentType.values()) {
                expect(ModrinthEnvironmentType.parse(ModrinthEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of ModrinthEnvironmentType.values()) {
                expect(ModrinthEnvironmentType.parse(ModrinthEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of ModrinthEnvironmentType.values()) {
                expect(ModrinthEnvironmentType.parse(ModrinthEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of ModrinthEnvironmentType.values()) {
                expect(ModrinthEnvironmentType.parse(ModrinthEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
