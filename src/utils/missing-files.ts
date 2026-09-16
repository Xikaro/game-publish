import { McPublishInput } from "@/action";
import { PlatformType, GenericPlatformUploadRequest } from "@/platforms";
import { FileInfo, getFilePatterns } from "@/utils/io";

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
            files?: FileInfo[];
            serverFiles?: FileInfo[];
        };

        if (!merged.token?.unwrap()) {
            continue;
        }

        const groups: Array<[string, FileInfo[] | undefined]> = [["files", merged.files]];
        if (platform === PlatformType.CURSEFORGE && merged.serverFiles !== undefined) {
            groups.push(["serverFiles", merged.serverFiles]);
        }

        for (const [parameter, files] of groups) {
            if (files && files.length > 0) {
                continue;
            }

            const patternList = getFilePatterns(files ?? []);
            const detail = patternList.length
                ? `no files matched the provided glob(s): ${patternList.join(", ")}`
                : "no files were specified";
            problems.push(`${PlatformType.friendlyNameOf(platform)} (${parameter}) — ${detail}`);
        }
    }

    return problems;
}
