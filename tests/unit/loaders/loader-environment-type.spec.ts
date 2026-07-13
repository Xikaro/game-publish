import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";

describe("LoaderEnvironmentType", () => {
    describe("supportsClient", () => {
        test("returns true for any client environment", () => {
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.CLIENT_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.CLIENT_OPTIONAL)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.CLIENT_PREFERRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SINGLEPLAYER_OPTIONAL)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SINGLEPLAYER_PREFERRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.ALL)).toBe(true);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.ANY)).toBe(true);
        });

        test("returns false for any server-only environment", () => {
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SERVER_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SERVER_PREFERRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.DEDICATED_SERVER_OPTIONAL)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.DEDICATED_SERVER_PREFERRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.SERVER_REQUIRED | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsClient(LoaderEnvironmentType.UNKNOWN)).toBe(false);
        });
    });

    describe("supportsServer", () => {
        test("returns true for any server environment", () => {
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SERVER_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SERVER_OPTIONAL)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SERVER_PREFERRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.DEDICATED_SERVER_OPTIONAL)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.DEDICATED_SERVER_PREFERRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.ALL)).toBe(true);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.ANY)).toBe(true);
        });

        test("returns false for any client-only environment", () => {
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.CLIENT_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.CLIENT_OPTIONAL)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.CLIENT_PREFERRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SINGLEPLAYER_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SINGLEPLAYER_OPTIONAL)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.SINGLEPLAYER_PREFERRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SINGLEPLAYER_REQUIRED)).toBe(false);
            expect(LoaderEnvironmentType.supportsServer(LoaderEnvironmentType.UNKNOWN)).toBe(false);
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of LoaderEnvironmentType.values()) {
                expect(LoaderEnvironmentType.parse(LoaderEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of LoaderEnvironmentType.values()) {
                expect(LoaderEnvironmentType.parse(LoaderEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of LoaderEnvironmentType.values()) {
                expect(LoaderEnvironmentType.parse(LoaderEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of LoaderEnvironmentType.values()) {
                expect(LoaderEnvironmentType.parse(LoaderEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
