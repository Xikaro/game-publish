import { McPublishInput } from "@/action";
import { FileInfo, findFilesSync } from "@/utils/io";
import { collectMissingFiles } from "@/utils/missing-files";
import { SecureString } from "@/utils/security";

function emptyFiles(pattern: string | string[]): FileInfo[] {
    return findFilesSync(pattern);
}

function createInput(overrides: Partial<McPublishInput> = {}): McPublishInput {
    return {
        github: {
            token: SecureString.from("github-token"),
            files: [FileInfo.of("mod.jar")],
        },
        curseforge: {
            token: SecureString.from("curseforge-token"),
            files: [FileInfo.of("mod.jar")],
        },
        modrinth: {
            token: SecureString.from("modrinth-token"),
            files: [FileInfo.of("mod.mrpack")],
        },
        ...overrides,
    } as McPublishInput;
}

describe("collectMissingFiles", () => {
    test("returns an empty list when every platform has its files", () => {
        expect(collectMissingFiles(createInput())).toEqual([]);
    });

    test("skips platforms without a token", () => {
        const input = createInput({
            github: {
                files: [],
            },
        });

        expect(collectMissingFiles(input)).toEqual([]);
    });

    test("reports the platform and globs when no files matched", () => {
        const input = createInput({
            github: {
                token: SecureString.from("github-token"),
                files: emptyFiles("build/libs/*.jar"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "GitHub (files) — no files matched the provided glob(s): build/libs/*.jar",
        ]);
    });

    test("reports all missing files across platforms at once", () => {
        const patterns = ["build/libs/-@(dev|sources|javadoc).jar", "build/libs/*-@(dev|sources|javadoc).jar"];
        const input = createInput({
            github: {
                token: SecureString.from("github-token"),
                files: emptyFiles(patterns),
            },
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("mod.jar")],
                serverFiles: emptyFiles("dist/*.zip"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "CurseForge (serverFiles) — no files matched the provided glob(s): dist/*.zip",
            `GitHub (files) — no files matched the provided glob(s): ${patterns.join(", ")}`,
        ]);
    });

    test("does not report missing CurseForge server files when they are omitted", () => {
        const input = createInput({
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("mod.jar")],
            },
        });

        expect(collectMissingFiles(input)).toEqual([]);
    });

    test("reports the CurseForge server files when they are explicitly provided but empty", () => {
        const input = createInput({
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("mod.jar")],
                serverFiles: emptyFiles("dist/*.zip"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "CurseForge (serverFiles) — no files matched the provided glob(s): dist/*.zip",
        ]);
    });
});
