import { McPublishInput } from "@/action";
import { PlatformType, GenericPlatformUploadRequest } from "@/platforms";
import { FileInfo, getFilePatterns } from "@/utils/io";
import { collectGitHubFiles, resolvePlatformFiles } from "@/utils/platform-files";

/**
 * Collects a list of missing file problems for all platforms that will be published.
 *
 * Platforms without a valid token are skipped, mirroring the logic in {@link publish}.
 *
 * @param input - The action input.
 *
 * @returns A list of human-readable problems describing the missing files.
 */
export function collectMissingFiles(input: McPublishInput): string[] {
    const problems = [] as string[];

    for (const platform of PlatformType.values()) {
        const platformOptions = { ...input, ...input[platform] } as McPublishInput[PlatformType];
        const merged = platformOptions as unknown as {
            token?: GenericPlatformUploadRequest["token"];
            serverFiles?: FileInfo[];
        };

        if (!merged.token?.unwrap()) {
            continue;
        }

        const files = platform === PlatformType.GITHUB
            ? collectGitHubFiles(input)
            : resolvePlatformFiles(platform, input);

        const platformFiles = input[platform]?.files;
        const parameterName = platformFiles === undefined ? "files" : `${platform}-files`;

        const groups: Array<[string, FileInfo[] | undefined]> = [[parameterName, files]];
        if (platform === PlatformType.CURSEFORGE && merged.serverFiles !== undefined) {
            groups.push(["curseforge-server-files", merged.serverFiles]);
        }

        for (const [parameter, fileList] of groups) {
            if (fileList && fileList.length > 0) {
                continue;
            }

            const patternList = getFilePatterns(fileList ?? []);
            const detail = patternList.length
                ? `no files matched the provided glob(s): ${patternList.join(", ")}`
                : "no files were specified";
            problems.push(`${PlatformType.friendlyNameOf(platform)} (${parameter}) — ${detail}`);
        }
    }

    return problems;
}
