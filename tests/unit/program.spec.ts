import { McPublishInput } from "@/action";
import { FileInfo, findFilesSync } from "@/utils/io";
import { collectMissingFiles } from "@/utils/missing-files";
import { collectGitHubFiles, resolvePlatformFiles } from "@/utils/platform-files";
import { PlatformType } from "@/platforms";
import { SecureString } from "@/utils/security";

function emptyFiles(pattern: string | string[]): FileInfo[] {
    return findFilesSync(pattern);
}

function createInput(overrides: Partial<McPublishInput> = {}): McPublishInput {
    return {
        files: [FileInfo.of("global.jar")],
        github: {
            token: SecureString.from("github-token"),
            files: [FileInfo.of("github-extra.jar")],
        },
        curseforge: {
            token: SecureString.from("curseforge-token"),
            files: [FileInfo.of("curseforge.zip")],
        },
        modrinth: {
            token: SecureString.from("modrinth-token"),
            files: [FileInfo.of("modrinth.mrpack")],
        },
        ...overrides,
    } as McPublishInput;
}

describe("resolvePlatformFiles", () => {
    test("uses platform-specific files when provided", () => {
        const input = createInput();
        expect(resolvePlatformFiles(PlatformType.MODRINTH, input)).toEqual([FileInfo.of("modrinth.mrpack")]);
        expect(resolvePlatformFiles(PlatformType.CURSEFORGE, input)).toEqual([FileInfo.of("curseforge.zip")]);
    });

    test("falls back to global files when platform-specific files are absent", () => {
        const input = createInput({
            modrinth: { token: SecureString.from("modrinth-token") },
        });
        expect(resolvePlatformFiles(PlatformType.MODRINTH, input)).toEqual([FileInfo.of("global.jar")]);
    });
});

describe("collectGitHubFiles", () => {
    test("returns the union of all platform files, server pack, global files and github-files", () => {
        const input = createInput({
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("curseforge.zip")],
                serverFiles: [FileInfo.of("serverpack.zip")],
            },
        });

        const files = collectGitHubFiles(input);
        expect(files?.map(f => f.path)).toEqual([
            "modrinth.mrpack",
            "curseforge.zip",
            "serverpack.zip",
            "global.jar",
            "github-extra.jar",
        ]);
    });

    test("de-duplicates files by path", () => {
        const input = createInput({
            files: [FileInfo.of("shared.jar")],
            modrinth: {
                token: SecureString.from("modrinth-token"),
                files: [FileInfo.of("shared.jar")],
            },
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("shared.jar")],
            },
            github: {
                token: SecureString.from("github-token"),
                files: [FileInfo.of("shared.jar")],
            },
        });

        expect(collectGitHubFiles(input)?.length).toBe(1);
    });
});

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

    test("reports the platform-specific input when it is empty", () => {
        const input = createInput({
            modrinth: {
                token: SecureString.from("modrinth-token"),
                files: emptyFiles("missing/*.mrpack"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "Modrinth (modrinth-files) — no files matched the provided glob(s): missing/*.mrpack",
        ]);
    });

    test("falls back to the global files when a platform-specific input is absent", () => {
        const input = createInput({
            files: emptyFiles("missing/*.jar"),
            modrinth: { token: SecureString.from("modrinth-token") },
            curseforge: { token: SecureString.from("curseforge-token") },
            github: { token: SecureString.from("github-token") },
        });

        expect(collectMissingFiles(input)).toEqual([
            "CurseForge (files) — no files matched the provided glob(s): missing/*.jar",
            "Modrinth (files) — no files matched the provided glob(s): missing/*.jar",
            "GitHub (files) — no files were specified",
        ]);
    });

    test("reports all missing files across platforms at once", () => {
        const patterns = ["build/libs/-@(dev|sources|javadoc).jar", "build/libs/*-@(dev|sources|javadoc).jar"];
        const input = createInput({
            modrinth: {
                token: SecureString.from("modrinth-token"),
                files: emptyFiles(patterns),
            },
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("curse.zip")],
                serverFiles: emptyFiles("dist/*.zip"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "CurseForge (curseforge-server-files) — no files matched the provided glob(s): dist/*.zip",
            `Modrinth (modrinth-files) — no files matched the provided glob(s): ${patterns.join(", ")}`,
        ]);
    });

    test("does not report missing CurseForge server files when they are omitted", () => {
        const input = createInput({
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("curse.zip")],
            },
        });

        expect(collectMissingFiles(input)).toEqual([]);
    });

    test("reports the CurseForge server files when they are explicitly provided but empty", () => {
        const input = createInput({
            curseforge: {
                token: SecureString.from("curseforge-token"),
                files: [FileInfo.of("curse.zip")],
                serverFiles: emptyFiles("dist/*.zip"),
            },
        });

        expect(collectMissingFiles(input)).toEqual([
            "CurseForge (curseforge-server-files) — no files matched the provided glob(s): dist/*.zip",
        ]);
    });
});
