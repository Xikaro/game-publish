import { readAllText } from "@/utils/io";

/**
 * Reads the changelog file matching the given pattern and extracts the section for the specified version.
 *
 * Supports common changelog formats such as Keep a Changelog:
 * - `## [1.2.3] - 2024-01-01`
 * - `## 1.2.3`
 * - `### v1.2.3`
 *
 * @param pattern - The path or glob pattern of the changelog file.
 * @param version - The version to look for.
 *
 * @returns The changelog body for the version, or `undefined` if no matching section is found.
 */
export async function readChangelogForVersion(pattern: string, version: string): Promise<string | undefined> {
    const text = await readAllText(pattern);
    return parseChangelogForVersion(text, version);
}

/**
 * Extracts the changelog section for the specified version from the given text.
 *
 * @param content - The changelog content.
 * @param version - The version to look for.
 *
 * @returns The changelog body for the version, or `undefined` if no matching section is found.
 */
export function parseChangelogForVersion(content: string, version: string): string | undefined {
    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const section = findVersionSection(normalized, version);
    if (section !== undefined) {
        return section;
    }

    const stripped = version.replace(/^v/i, "");
    if (stripped !== version) {
        return findVersionSection(normalized, stripped);
    }

    const prefixed = `v${version}`;
    return findVersionSection(normalized, prefixed);
}

function findVersionSection(content: string, version: string): string | undefined {
    const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const headingPattern = new RegExp(`^(#{1,3})\\s*\\[?${escaped}\\]?`, "m");

    const match = headingPattern.exec(content);
    if (!match) {
        return undefined;
    }

    const start = match.index;
    const level = match[1].length;
    const lineEnd = content.indexOf("\n", start);
    const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;

    const nextHeading = new RegExp(`^#{1,${level}}\\s`, "m");
    const rest = content.slice(bodyStart);
    const nextMatch = nextHeading.exec(rest);
    const bodyEnd = nextMatch ? bodyStart + nextMatch.index : content.length;

    return content
        .slice(bodyStart, bodyEnd)
        .replace(/\n+$/, "")
        .trim();
}
