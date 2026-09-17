import { parseChangelogForVersion } from "@/utils/changelog-parser";

describe("changelog-parser", () => {
    describe("parseChangelogForVersion", () => {
        test("extracts a keep-a-changelog section", () => {
            const changelog = `# Changelog

## [1.0.1] - 2024-01-02
- Fix bug

## [1.0.0] - 2024-01-01
- Initial release
`;

            const result = parseChangelogForVersion(changelog, "1.0.1");
            expect(result).toBe("- Fix bug");
        });

        test("matches versions with a v prefix", () => {
            const changelog = `## v1.2.3
- Change
`;

            const result = parseChangelogForVersion(changelog, "1.2.3");
            expect(result).toBe("- Change");
        });

        test("matches versions without brackets", () => {
            const changelog = `## 2.0.0
### Added
- Feature
`;

            const result = parseChangelogForVersion(changelog, "2.0.0");
            expect(result).toBe("### Added\n- Feature");
        });

        test("stops at the next same-level heading", () => {
            const changelog = `## [1.0.0] - 2024-01-01
- First

## [0.9.0] - 2023-12-01
- Earlier
`;

            const result = parseChangelogForVersion(changelog, "1.0.0");
            expect(result).toBe("- First");
        });

        test("returns undefined for a missing version", () => {
            const changelog = `## [1.0.0]
- Change
`;

            const result = parseChangelogForVersion(changelog, "1.1.0");
            expect(result).toBeUndefined();
        });
    });
});
