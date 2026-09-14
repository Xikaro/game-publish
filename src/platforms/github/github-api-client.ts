import { FileInfo } from "@/utils/io";
import { Fetch, HttpRequest, HttpResponse, createFetch, defaultResponse, throwOnError } from "@/utils/net";
import { GitHubRelease, GitHubReleaseAssetsPatch, GitHubReleaseIdentifier, GitHubReleaseInit, GitHubReleaseNotes, GitHubReleaseNotesInit, GitHubReleasePatch, packGitHubReleaseInit, packGitHubReleasePatch } from "./github-release";
import { GitHubReleaseAsset, GitHubReleaseAssetIdentifier, GitHubReleaseAssetInit } from "./github-release-asset";

/**
 * The base URL for the GitHub API.
 */
export const GITHUB_API_URL = "https://api.github.com";

/**
 * The API version being used by the API client.
 */
export const GITHUB_API_VERSION = "2022-11-28";

/**
 * Describes the configuration options for the GitHub API client.
 */
export interface GitHubApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the GitHub API.
     *
     * Defaults to {@link GITHUB_API_URL}.
     */
    baseUrl?: string | URL;

    /**
     * The API token to be used for authentication with the GitHub API.
     */
    token?: string;
}

/**
 * A client for interacting with the GitHub API.
 */
export class GitHubApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * Creates a new {@link GitHubApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: GitHubApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || GITHUB_API_URL,
            defaultHeaders: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": GITHUB_API_VERSION,
                "Authorization": options?.token && `Bearer ${options.token}`,
            },
        })
        .use(defaultResponse({ response: r => HttpResponse.json(null, r) }))
        .use(throwOnError({ filter: x => !x.ok && x.status !== 404 }));
    }

    /**
     * Fetches a GitHub release based on the provided identifier.
     *
     * @param release - The identifier for the release to fetch.
     *
     * @returns The fetched release, or `undefined` if not found.
     */
    async getRelease(release: GitHubReleaseIdentifier): Promise<GitHubRelease | undefined> {
        const { owner, repo, id, tag_name } = release;

        const url = typeof id === "number" ? `/repos/${owner}/${repo}/releases/${id}` : `/repos/${owner}/${repo}/releases/tags/${tag_name}`;
        const response = await this._fetch(url);
        return (await response.json()) ?? undefined;
    }

    /**
     * Creates a new GitHub release with the provided information.
     *
     * @param release - The information for the release to create.
     *
     * @returns The created release.
     */
    async createRelease(release: GitHubReleaseInit): Promise<GitHubRelease> {
        const { owner, repo, assets } = release;

        const data = await this.prepareReleaseMutation(packGitHubReleaseInit(release), owner, repo);
        const response = await this._fetch(`/repos/${owner}/${repo}/releases`, HttpRequest.post().json(data));
        const createdRelease = await response.json() as GitHubRelease;

        if (assets?.length) {
            return await this.updateRelease({ owner, repo, id: createdRelease.id, assets });
        }
        return createdRelease;
    }

    /**
     * Updates an existing GitHub release with the provided information.
     *
     * @param release - The information for the release to update.
     *
     * @returns The updated release.
     */
    async updateRelease(release: GitHubReleasePatch): Promise<GitHubRelease> {
        const { owner, repo, id, assets } = release;

        if (assets?.length) {
            await this.updateReleaseAssets({ owner, repo, id, assets, overwrite_files: release.overwrite_files, preserve_order: release.preserve_order });
        }

        const data = await this.prepareReleaseMutation(packGitHubReleasePatch(release), owner, repo);
        const shouldUpdate = Object.values(data).filter(x => x !== undefined).length !== 0;
        if (!shouldUpdate) {
            return await this.getRelease(release);
        }

        const response = await this._fetch(`/repos/${owner}/${repo}/releases/${id}`, HttpRequest.patch().json(data));
        return await response.json();
    }

    /**
     * Updates the assets of an existing GitHub release.
     *
     * @param releaseAssets - The information for the release assets to update.
     *
     * @returns An array of updated release assets.
     */
    async updateReleaseAssets(releaseAssets: GitHubReleaseAssetsPatch): Promise<GitHubReleaseAsset[]> {
        const { owner, repo, id, assets, overwrite_files, preserve_order } = releaseAssets;
        const release = await this.getRelease({ owner, repo, id });

        if (!release) {
            throw new Error(`GitHub release ${id} was not found.`);
        }

        const uploadAsset = async (asset: FileInfo | string): Promise<GitHubReleaseAsset> => {
            const file = FileInfo.of(asset);
            const existingAsset = release.assets.find(x => x.name === file.name || x.name === file.path);

            if (existingAsset) {
                if (overwrite_files === false) {
                    return existingAsset;
                }
                await this.deleteReleaseAsset({ owner, repo, id: existingAsset.id });
            }

            return await this.uploadReleaseAsset({ upload_url: release.upload_url, asset: file });
        };

        if (preserve_order) {
            const uploadedAssets = [] as GitHubReleaseAsset[];
            for (const asset of assets) {
                uploadedAssets.push(await uploadAsset(asset));
            }
            return uploadedAssets;
        }

        return await Promise.all(assets.map(uploadAsset));
    }

    /**
     * Requests GitHub to generate the release notes for the specified tag.
     *
     * @param release - The information for the release notes to generate.
     *
     * @returns The generated release notes.
     */
    async generateReleaseNotes(release: GitHubReleaseNotesInit): Promise<GitHubReleaseNotes> {
        const { owner, repo, tag_name, target_commitish, previous_tag_name } = release;

        const data = { tag_name, target_commitish, previous_tag_name };
        const response = await this._fetch(`/repos/${owner}/${repo}/releases/generate-notes`, HttpRequest.post().json(data));
        return await response.json();
    }

    /**
     * Resolves the release body and relevant parameters for a release mutation,
     * generating the release notes via the GitHub API when requested.
     *
     * @param data - The packed release mutation parameters.
     * @param owner - The account owner of the repository.
     * @param repo - The name of the repository.
     *
     * @returns The prepared mutation parameters, ready to be sent to the GitHub API.
     */
    private async prepareReleaseMutation<T extends {
        tag_name?: string;
        target_commitish?: string;
        body?: string;
        generate_release_notes?: boolean;
        previous_tag_name?: string;
    }>(data: T, owner: string, repo: string): Promise<T> {
        if (!data.generate_release_notes || !data.previous_tag_name || !data.tag_name) {
            return data;
        }

        const notes = await this.generateReleaseNotes({
            owner,
            repo,
            tag_name: data.tag_name,
            target_commitish: data.target_commitish,
            previous_tag_name: data.previous_tag_name,
        });

        return {
            ...data,
            generate_release_notes: false,
            previous_tag_name: undefined,
            body: data.body ? `${data.body}\n\n${notes.body}` : notes.body,
        };
    }

    /**
     * Uploads a release asset to a GitHub release.
     *
     * @param asset - The information for the release asset to upload.
     *
     * @returns The uploaded release asset.
     */
    private async uploadReleaseAsset(asset: GitHubReleaseAssetInit): Promise<GitHubReleaseAsset> {
        const { upload_url, asset: file } = asset;

        const url = upload_url.includes("{") ? upload_url.substring(0, upload_url.indexOf("{")) : upload_url;
        const fileInfo = FileInfo.of(file);
        const fileName = encodeURIComponent(fileInfo.name);
        const fileContent = fileInfo.stream();

        const response = await this._fetch(`${url}?name=${fileName}`, HttpRequest.post().with(fileContent));
        return await response.json();
    }

    /**
     * Deletes a GitHub release.
     *
     * @param release - The identifier for the release to delete.
     *
     * @returns `true` if the release was deleted successfully, `false` otherwise.
     */
    async deleteRelease(release: GitHubReleaseIdentifier): Promise<boolean> {
        const { owner, repo, id } = release;

        if (typeof id !== "number") {
            const existing = await this.getRelease(release);
            if (!existing) {
                return false;
            }
            return this.deleteRelease({ owner, repo, id: existing.id });
        }

        const response = await this._fetch(`/repos/${owner}/${repo}/releases/${id}`, HttpRequest.delete());
        return response.ok;
    }

    /**
     * Deletes a GitHub release asset.
     *
     * @param asset - The identifier for the release asset to delete.
     *
     * @returns `true` if the asset was deleted successfully, `false` otherwise.
     */
    async deleteReleaseAsset(asset: GitHubReleaseAssetIdentifier): Promise<boolean> {
        const { owner, repo, id } = asset;

        const response = await this._fetch(`/repos/${owner}/${repo}/releases/assets/${id}`, HttpRequest.delete());
        return response.ok;
    }
}
