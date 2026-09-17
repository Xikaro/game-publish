import { CurseForgeUploadRequest as UploadRequest } from "@/action";
import { Dependency } from "@/dependencies";
import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";
import { PlatformType } from "@/platforms/platform-type";
import { GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";
import { UploadedFile } from "@/platforms/uploaded-file";
import { ArgumentError } from "@/utils/errors";
import { SecureString } from "@/utils/security";
import { stringEquals } from "@/utils/string-utils";
import { CurseForgeDependency } from "./curseforge-dependency";
import { CurseForgeDependencyType } from "./curseforge-dependency-type";
import { CurseForgeEnvironmentType } from "./curseforge-environment-type";
import { CurseForgeEternalApiClient } from "./curseforge-eternal-api-client";
import { CurseForgeProject, isCurseForgeProjectId } from "./curseforge-project";
import { CurseForgeUploadApiClient } from "./curseforge-upload-api-client";
import { CurseForgeVersion } from "./curseforge-version";

/**
 * Configuration options for the uploader, tailored for use with CurseForge.
 */
export type CurseForgeUploaderOptions = GenericPlatformUploaderOptions;

/**
 * Defines the structure for an upload request, adapted for use with CurseForge.
 */
export type CurseForgeUploadRequest = UploadRequest;

/**
 * Specifies the structure of the report generated after a successful upload to CurseForge.
 */
export interface CurseForgeUploadReport {
    id: number;
    version: number;
    url: string;
    files: UploadedFile[];
}

/**
 * Implements the uploader for CurseForge.
 */
export class CurseForgeUploader extends GenericPlatformUploader<CurseForgeUploaderOptions, CurseForgeUploadRequest, CurseForgeUploadReport> {
    /**
     * The token used for the last upload, retained for rollback.
     */
    private _token?: SecureString;

    /**
     * Constructs a new {@link CurseForgeUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    constructor(options?: CurseForgeUploaderOptions) {
        super(options);
    }

    /**
     * @inheritdoc
     */
    get platform(): PlatformType {
        return PlatformType.CURSEFORGE;
    }

    /**
     * @inheritdoc
     */
    protected async uploadCore(request: CurseForgeUploadRequest): Promise<CurseForgeUploadReport> {
        ArgumentError.throwIfNullOrEmpty(request.id, "request.id", "A project ID is required to upload files to CurseForge.");
        ArgumentError.throwIfNullOrEmpty(request.loaders, "request.loaders", "At least one loader should be specified to upload files to CurseForge.");
        ArgumentError.throwIfNullOrEmpty(request.gameVersions, "request.gameVersions", "At least one game version should be specified to upload files to CurseForge.");

        this._token = request.token;
        const api = new CurseForgeUploadApiClient({ token: request.token.unwrap(), fetch: this._fetch });
        const eternalApi = new CurseForgeEternalApiClient({ fetch: this._fetch });

        const project = await this.getProject(request.id, eternalApi);
        const version = await this.createVersion(request, project.id, api, eternalApi);

        return {
            id: project.id,
            version: version.id,
            url: `${project.links.websiteUrl}/files/${version.id}`,
            files: version.files.map(x => ({ id: x.id, name: x.name, url: x.url })),
        };
    }

    /**
     * Fetches the project details from CurseForge.
     *
     * @param idOrSlug - The identifier or slug of the project.
     * @param eternalApi - The API client instance to use for the request.
     *
     * @returns A promise resolved with the fetched project details.
     */
    private async getProject(idOrSlug: number | string, eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeProject> {
        const project = await eternalApi.getProject(idOrSlug).catch(() => undefined as CurseForgeProject);
        if (project) {
            return project;
        }

        if (!isCurseForgeProjectId(idOrSlug)) {
            throw new Error(`Cannot access CurseForge project "${idOrSlug}" by its slug. Please specify the ID instead.`);
        }

        // If the project was not found, it could imply two situations:
        //   1) The project is not publicly visible.
        //   2) CurseForge is notorious for its frequent downtime. There's a significant probability that
        //      we attempted to access their API during one of those periods.
        //
        // Regardless, if the user provided us with a project ID, that's all we need
        // to attempt publishing their assets. Although the upload report may be imprecise
        // with this placeholder data, it's still preferable to not uploading anything at all.
        this._logger.debug(`CurseForge project "${idOrSlug}" is inaccessible.`);
        return {
            id: +idOrSlug,
            slug: String(idOrSlug),
            links: { websiteUrl: `https://www.curseforge.com/minecraft/mc-mods/${idOrSlug}` },
        } as CurseForgeProject;
    }


    /**
     * Creates a new version of the project on CurseForge.
     *
     * @param request - The upload request containing information about the new version.
     * @param projectId - The identifier of the project.
     * @param api - The API client instance to use for the upload request.
     * @param eternalApi - The API client instance to use for retrieving data.
     *
     * @returns The details of the newly created version.
     */
    private async createVersion(request: CurseForgeUploadRequest, projectId: number, api: CurseForgeUploadApiClient, eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeVersion> {
        const dependencies = await this.convertToCurseForgeDependencies(request.dependencies, eternalApi);
        const environments = CurseForgeEnvironmentType.fromLoaderEnvironmentType(request.environment || LoaderEnvironmentType.ALL);

        return await api.createVersion({
            name: request.name,
            project_id: projectId,
            version_type: request.versionType,
            changelog: request.changelog,
            changelog_type: request.changelogFormat as "text" | "html" | "markdown" | undefined,
            game_versions: request.gameVersions,
            java_versions: request.java,
            loaders: request.loaders,
            files: request.files,
            server_files: request.serverFiles,
            dependencies,
            environments,
        });
    }

    /**
     * Converts the dependencies to CurseForge-specific format.
     *
     * @param dependencies - The list of dependencies to convert.
     * @param eternalApi - The API client instance to use for retrieving data.
     *
     * @returns An array of converted dependencies.
     */
    private async convertToCurseForgeDependencies(dependencies: Dependency[], eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeDependency[]> {
        const simpleDependencies = this.convertToSimpleDependencies(dependencies, CurseForgeDependencyType.fromDependencyType);
        const curseForgeDependencies = await Promise.all(simpleDependencies.map(async ([id, type]) => ({
            slug: isCurseForgeProjectId(id)
                ? await eternalApi.getProject(id).catch(() => undefined as CurseForgeProject).then(x => x?.slug)
                : id,

            type,
        })));
        const uniqueCurseForgeDependencies = curseForgeDependencies
            .filter(x => x.slug && x.type)
            .filter((x, i, self) => i === self.findIndex(y => stringEquals(x.slug, y.slug, { ignoreCase: true })));

        return uniqueCurseForgeDependencies;
    }

    /**
     * @inheritdoc
     */
    async rollback(report: CurseForgeUploadReport): Promise<void> {
        const token = this._token;
        if (!token) {
            this._logger.debug("Cannot roll back CurseForge upload: no token available.");
            return;
        }

        if (!report?.id || !report?.files?.length) {
            this._logger.warn("⚠️ Cannot roll back CurseForge upload: insufficient report data.");
            return;
        }

        this._logger.warn("⚠️ CurseForge rollback is best-effort: CurseForge does not expose a public API for deleting files. Files may need to be removed manually.");

        const api = new CurseForgeUploadApiClient({ token: token.unwrap(), fetch: this._fetch });
        for (const file of report.files) {
            try {
                const deleted = await api.deleteFile(report.id, file.id as number);
                if (deleted) {
                    this._logger.info(`🗑️ Rolled back CurseForge file '${file.name}'`);
                } else {
                    this._logger.warn(`⚠️ Could not delete CurseForge file '${file.name}' (the CurseForge Upload API does not support file deletion)`);
                }
            } catch (e) {
                this._logger.warn(`⚠️ Failed to roll back CurseForge file '${file.name}': ${e}`);
            }
        }
    }
}
