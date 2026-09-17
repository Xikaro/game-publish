import { McPublishInput } from "@/action";
import { PlatformType } from "@/platforms";
import { FileInfo, fileEquals } from "@/utils/io";

/**
 * Resolves the files that should be uploaded to the specified platform.
 *
 * If the platform defines its own `files` input, that list is used; otherwise the
 * global `files` input is used as a fallback.
 *
 * @param platform - The target platform.
 * @param input - The action input.
 *
 * @returns The files to upload, or `undefined` if no files were specified.
 */
export function resolvePlatformFiles(platform: PlatformType, input: McPublishInput): FileInfo[] | undefined {
    const platformFiles = input[platform]?.files;
    if (platformFiles === undefined) {
        return input.files;
    }

    return platformFiles;
}

/**
 * Collects all files that should be attached to the GitHub Release.
 *
 * The result is the de-duplicated union of:
 *   - files published to Modrinth (or the global fallback)
 *   - files published to CurseForge (or the global fallback)
 *   - CurseForge server pack files
 *   - the global `files` input
 *   - explicit extra `github-files`
 *
 * @param input - The action input.
 *
 * @returns The files to upload to GitHub, or `undefined` if no files were specified.
 */
export function collectGitHubFiles(input: McPublishInput): FileInfo[] | undefined {
    const modrinthFiles = resolvePlatformFiles(PlatformType.MODRINTH, input);
    const curseforgeFiles = resolvePlatformFiles(PlatformType.CURSEFORGE, input);
    const curseforgeServerFiles = input.curseforge?.serverFiles;
    const githubFiles = input.github?.files;

    const union = [] as FileInfo[];

    const add = (files: FileInfo[] | undefined): void => {
        if (!files?.length) {
            return;
        }

        for (const file of files) {
            if (!union.some(existing => fileEquals(existing, file))) {
                union.push(file);
            }
        }
    };

    add(modrinthFiles);
    add(curseforgeFiles);
    add(curseforgeServerFiles);
    add(input.files);
    add(githubFiles);

    return union.length ? union : undefined;
}
