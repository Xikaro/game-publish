import { GitHubUploadReport as UploadReport, GitHubUploadRequest as UploadRequest } from "@/action";
import { GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";
import { PlatformType } from "@/platforms/platform-type";
import { ArgumentError, ArgumentNullError } from "@/utils/errors";
import { VersionType } from "@/utils/versioning";
import { GitHubApiClient } from "./github-api-client";
import { GitHubContext } from "./github-context";
import { GitHubRelease, GitHubReleasePatch, isGitHubMakeLatest } from "./github-release";
import { GitHubRepositoryIdentifier } from "./github-repository";
import { SecureString } from "@/utils/security";

/**
 * The prefix for Git tag refs in the format "refs/tags/".
 */
const GITHUB_REF_TAG_PREFIX = "refs/tags/";

/**
 * Configuration options for the uploader, tailored for use with GitHub.
 */
export interface GitHubUploaderOptions extends GenericPlatformUploaderOptions {
    /**
     * Provides the context of the current GitHub Actions workflow run.
     */
    githubContext: GitHubContext;
}

/**
 * Defines the structure for an upload request, adapted for use with GitHub.
 */
export type GitHubUploadRequest = UploadRequest;

/**
 * Specifies the structure of the report generated after a successful upload to GitHub.
 */
export type GitHubUploadReport = UploadReport;

/**
 * Implements the uploader for GitHub.
 */
export class GitHubUploader extends GenericPlatformUploader<GitHubUploaderOptions, GitHubUploadRequest, GitHubUploadReport> {
    /**
     * Provides the context of the current GitHub Actions workflow run.
     */
    private readonly _context: GitHubContext;

    /**
     * The token used for the last upload, retained for rollback.
     */
    private _token?: SecureString;

    /**
     * Whether the release was created by the last upload.
     *
     * Used to avoid rolling back releases that existed before this action ran.
     */
    private _createdRelease = false;

    /**
     * Constructs a new {@link GitHubUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    constructor(options: GitHubUploaderOptions) {
        super(options);
        this._context = options?.githubContext;
    }

    /**
     * @inheritdoc
     */
    get platform(): PlatformType {
        return PlatformType.GITHUB;
    }

    /**
     * @inheritdoc
     */
    protected async uploadCore(request: GitHubUploadRequest): Promise<GitHubUploadReport> {
        this._token = request.token;
        const api = new GitHubApiClient({ token: request.token.unwrap(), fetch: this._fetch, baseUrl: this._context.apiUrl });
        const repo = this.resolveRepository(request);

        const release = await this.updateOrCreateRelease(request, api, repo);

        return {
            repo: `${repo.owner}/${repo.repo}`,
            tag: release.tag_name,
            url: release.html_url,
            files: release.assets.map(x => ({ id: x.id, name: x.name, url: x.browser_download_url })),
        };
    }

    /**
     * @inheritdoc
     */
    async rollback(report: GitHubUploadReport): Promise<void> {
        const token = this._token;
        if (!token) {
            this._logger.debug("Cannot roll back GitHub release: no token available.");
            return;
        }

        if (!this._createdRelease) {
            this._logger.debug("Cannot roll back GitHub release: the release was not created by this action.");
            return;
        }

        if (!report?.repo || !report?.tag) {
            this._logger.warn("⚠️ Cannot roll back GitHub release: insufficient report data.");
            return;
        }

        const [owner, repo] = report.repo.split("/");
        try {
            const api = new GitHubApiClient({ token: token.unwrap(), fetch: this._fetch, baseUrl: this._context.apiUrl });
            const deleted = await api.deleteRelease({ owner, repo, tag_name: report.tag });
            if (deleted) {
                this._logger.info(`🗑️ Rolled back GitHub release '${report.tag}' from ${report.repo}`);

                const tagDeleted = await api.deleteTag({ owner, repo, tag_name: report.tag });
                if (tagDeleted) {
                    this._logger.info(`🗑️ Rolled back GitHub tag '${report.tag}'`);
                } else {
                    this._logger.warn(`⚠️ Could not delete GitHub tag '${report.tag}'`);
                }
            } else {
                this._logger.warn(`⚠️ Could not delete GitHub release '${report.tag}' (it may not exist anymore)`);
            }
        } catch (e) {
            this._logger.warn(`⚠️ Failed to roll back GitHub release '${report.tag}': ${e}`);
        }
    }

    /**
     * Resolves the repository where the release should be published, using the
     * repository specified in the request or falling back to the context.
     *
     * @param request - Contains parameters that define the desired release.
     *
     * @returns The resolved repository identifier.
     */
    private resolveRepository(request: GitHubUploadRequest): GitHubRepositoryIdentifier {
        const repository = request.repository?.trim();
        if (repository) {
            const separator = repository.indexOf("/");
            if (separator > 0 && separator < repository.length - 1 && !repository.includes("/", separator + 1)) {
                return {
                    owner: repository.substring(0, separator),
                    repo: repository.substring(separator + 1),
                };
            }
            throw new ArgumentError(`Invalid repository '${repository}'. Expected the 'owner/repository' format.`);
        }

        const repo = this._context.repo;
        ArgumentNullError.throwIfNull(repo, "context.repo", "The information about the repository is required to upload files to GitHub.");
        return repo;
    }

    /**
     * Retrieves the ID of an existing release that matches the request parameters.
     * If no such release exists, it creates a new release and returns its ID.
     *
     * @param request - Contains parameters that define the desired release.
     * @param api - An instance of the GitHub API client for interacting with GitHub services.
     * @param repo - The identifier of the repository to publish the release to.
     *
     * @returns The ID of the release and a boolean indicating whether a new release was created.
     */
    private async getOrCreateReleaseId(request: GitHubUploadRequest, api: GitHubApiClient, repo: GitHubRepositoryIdentifier): Promise<[id: number, created: boolean]> {
        const tag = normalizeTag(request.tag || this._context.tag || request.version);

        let id = undefined as number;
        let created = false;

        if (request.tag) {
            id = await api.getRelease({ ...repo, tag_name: normalizeTag(request.tag) }).then(x => x?.id);
        } else if (this._context.payload.release?.id) {
            id = this._context.payload.release.id;
        } else if (tag) {
            id = await api.getRelease({ ...repo, tag_name: tag }).then(x => x?.id);
        }

        if (!id && tag) {
            const prerelease = request.prerelease ?? request.versionType !== VersionType.RELEASE;
            const generateReleaseNotes = request.generateChangelog ?? !request.changelog;

            // Non-prerelease releases are created as drafts and published after their
            // assets have been uploaded; prereleases are created published so that the
            // `release.prereleased` event is fired, unless explicitly requested as drafts.
            const draft = prerelease ? request.draft === true : true;

            id = (await api.createRelease({
                ...repo,
                tag_name: tag,
                target_commitish: request.commitish,
                name: request.name,
                body: request.changelog,
                draft,
                prerelease,
                discussion_category_name: request.discussion,
                generate_release_notes: generateReleaseNotes,
                make_latest: isGitHubMakeLatest(request.makeLatest) ? request.makeLatest : undefined,
                previous_tag_name: generateReleaseNotes ? request.previousTag : undefined,
            }))?.id;

            created = true;
        }

        if (!id) {
            throw new Error(`Cannot find or create GitHub Release${tag ? ` (${tag})` : ""}.`);
        }

        return [id, created];
    }

    /**
     * Updates or creates a GitHub release based on the provided request.
     *
     * @param request - Contains parameters that define the changes to apply to the release.
     * @param api - An instance of the GitHub API client for interacting with GitHub services.
     * @param repo - The identifier of the repository to publish the release to.
     *
     * @returns The release data from GitHub.
     */
    private async updateOrCreateRelease(request: GitHubUploadRequest, api: GitHubApiClient, repo: GitHubRepositoryIdentifier): Promise<GitHubRelease> {
        const [id, created] = await this.getOrCreateReleaseId(request, api, repo);
        this._createdRelease = created;

        const patch = { ...repo, id } as GitHubReleasePatch;

        if (request.files?.length) {
            patch.assets = request.files;
            patch.preserve_order = request.preserveOrder;
            patch.overwrite_files = request.overwriteFiles;
        }
        if (isGitHubMakeLatest(request.makeLatest)) {
            patch.make_latest = request.makeLatest;
        }

        if (!created && request.changelog) {
            const existing = request.appendBody ? await api.getRelease({ ...repo, id }) : undefined;
            patch.body = request.appendBody ? `${existing?.body ?? ""}\n${request.changelog}` : request.changelog;
        }

        let release = await api.updateRelease(patch);

        // Publish the newly created draft release now that its assets have been uploaded.
        if (created && request.draft !== true && release.draft) {
            release = await api.updateRelease({
                ...repo,
                id,
                draft: false,
                make_latest: isGitHubMakeLatest(request.makeLatest) ? request.makeLatest : undefined,
            });
        }

        return release;
    }
}

/**
 * Removes the `refs/tags/` prefix from the specified tag, if present.
 *
 * @param tag - The tag to normalize.
 *
 * @returns The normalized tag.
 */
function normalizeTag(tag: string | undefined): string | undefined {
    if (tag?.startsWith(GITHUB_REF_TAG_PREFIX)) {
        return tag.substring(GITHUB_REF_TAG_PREFIX.length);
    }
    return tag;
}
