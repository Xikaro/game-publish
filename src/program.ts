import { McPublishInput, McPublishOutput } from "@/action";
import { readChangelogForVersion } from "@/utils/changelog-parser";
import { GameVersionFilter, getGameVersionProviderByName } from "@/games";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata, LoaderMetadataReader, createDefaultLoaderMetadataReader } from "@/loaders";
import { PlatformType, PlatformUploader, GenericPlatformUploadRequest, createPlatformUploader } from "@/platforms";
import { GitHubContext } from "@/platforms/github";
import { SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER, createActionOutputControllerUsingMetadata, getActionOutput, getAllActionInputsAsObjectUsingMetadata, parseActionMetadataFromFile, setActionOutput } from "@/utils/actions";
import { ENVIRONMENT } from "@/utils/environment";
import { ArgumentError, ArgumentNullError, ErrorBuilder, FailMode, FileNotFoundError } from "@/utils/errors";
import { getFilePatterns } from "@/utils/io";
import { collectMissingFiles } from "@/utils/missing-files";
import { collectGitHubFiles, resolvePlatformFiles } from "@/utils/platform-files";
import { Logger, getDefaultLogger } from "@/utils/logging";
import { $i } from "@/utils/collections";
import { DYNAMIC_MODULE_LOADER } from "@/utils/reflection";
import { UnionToIntersection } from "@/utils/types";
import { VersionType } from "@/utils/versioning";
import { PathLike } from "node:fs";

/**
 * Represents a GitHub Action.
 */
interface Action {
    /**
     * Gets the input of the action.
     */
    get input(): McPublishInput;

    /**
     * Gets the output of the action.
     */
    get output(): McPublishOutput;
}

/**
 * The main entry point of the program.
 *
 * @returns A promise that resolves when the program execution is complete.
 */
export async function main(): Promise<void> {
    const env = ENVIRONMENT;

    const logger = getDefaultLogger(env);

    try {
        const action = await initializeAction(new URL("../action.yml", import.meta.url), env);

        const githubContext = new GitHubContext(env);
        await publish(action, githubContext, logger);
    } catch (e) {
        logger.fatal(e);
        throw e;
    }
}

/**
 * Publishes the assets to all available platforms.
 *
 * @param action - The action details.
 * @param githubContext - The GitHub context.
 * @param logger - The logger to use for logging messages.
 *
 * @returns A promise that resolves when the publishing is complete.
 */
async function publish(action: Action, githubContext: GitHubContext, logger: Logger): Promise<void> {
    const metadataReader = createDefaultLoaderMetadataReader();
    const errors = new ErrorBuilder(logger);
    const processedPlatforms = [] as PlatformType[];
    const published = new Map<PlatformType, { uploader: PlatformUploader<GenericPlatformUploadRequest, unknown>; report: unknown }>();

    const missingFiles = collectMissingFiles(action.input);
    if (missingFiles.length > 0) {
        const error = new Error(`Cannot publish the release, missing files:\n\n${missingFiles.map(x => `    - ${x}`).join("\n")}`);
        logger.error(error);
        throw error;
    }

    if (action.input.changelogFile && action.input.version) {
        try {
            const changelog = await readChangelogForVersion(action.input.changelogFile, action.input.version);
            if (changelog) {
                action.input.changelog = changelog;
            } else {
                logger.warn(`⚠️ Could not find a changelog section for version '${action.input.version}' in '${action.input.changelogFile}'.`);
            }
        } catch (e) {
            logger.warn(`⚠️ Could not read changelog file '${action.input.changelogFile}': ${e}`);
        }
    }

    const enabledPlatforms = $i(PlatformType.values()).filter(platform => action.input[platform]?.token?.unwrap()).toArray();
    const skippedPlatforms = $i(PlatformType.values()).filter(platform => !action.input[platform]?.token?.unwrap()).toArray();
    logger.info(`📦 Publishing to: ${enabledPlatforms.map(p => PlatformType.friendlyNameOf(p)).join(", ") || "none"}`);
    if (skippedPlatforms.length > 0) {
        logger.info(`⏭️ Skipping: ${skippedPlatforms.map(p => PlatformType.friendlyNameOf(p)).join(", ")} (no token provided)`);
    }

    for (const platform of PlatformType.values()) {
        const platformOptions = { ...action.input, ...action.input[platform] };

        // For GitHub, use only github-specific name (github-name) and ignore the generic root name
        // unless it is explicitly provided in the github section.
        if (platform === PlatformType.GITHUB) {
            const platformSpecific = action.input[platform] as unknown as Record<string, unknown> | undefined;
            const githubHasOwnName = platformSpecific && Object.hasOwn(platformSpecific, "name") && platformSpecific.name !== null && platformSpecific.name !== undefined;
            if (!githubHasOwnName) {
                delete platformOptions.name;
            }
            platformOptions.files = collectGitHubFiles(action.input);
            const githubFileNames = platformOptions.files?.map(file => file.name).join(", ") ?? "none";
            logger.info(`🗂️ GitHub release will include ${platformOptions.files?.length ?? 0} file(s): ${githubFileNames}`);
        } else {
            const usesPlatformFiles = action.input[platform]?.files !== undefined;
            platformOptions.files = resolvePlatformFiles(platform, action.input);
            const source = usesPlatformFiles ? `${platform}-files` : "files";
            logger.info(`📁 ${PlatformType.friendlyNameOf(platform)} will use '${source}' input`);
        }
        if (!platformOptions?.token?.unwrap()) {
            logger.debug(`Skipping ${PlatformType.friendlyNameOf(platform)}: no token provided.`);
            continue;
        }

        const fileNames = platformOptions.files?.map(file => file.name).join(", ") ?? "none";
        logger.info(`🚀 Preparing to publish to ${PlatformType.friendlyNameOf(platform)} with files: ${fileNames}`);

        const options = await fillInDefaultValues(platformOptions as McPublishInput[PlatformType], platform, githubContext, metadataReader);

        logger.info(`🔖 ${PlatformType.friendlyNameOf(platform)} version: ${options.version ?? "<auto>"}, name: ${options.name ?? "<auto>"}, loaders: ${options.loaders?.join(", ") ?? "<auto>"}, game versions: ${options.gameVersions?.join(", ") ?? "<auto>"}`);
        const uploader = createPlatformUploader(platform, { logger, githubContext });
        try {
            const report = await uploader.upload(options);
            (action.output as unknown as Record<string, unknown>)[platform as string] = report;

            const uploadedFiles = (report as { files: { id: number | string; name: string; url: string }[] }).files;
            const fileMap = Object.fromEntries(uploadedFiles.map(file => [file.name, file.url]));
            setActionOutput(`${platform as string}-files`, JSON.stringify(fileMap));
            setActionOutput(`${platform as string}-assets`, JSON.stringify(uploadedFiles));

            processedPlatforms.push(platform);
            published.set(platform, { uploader, report });
        } catch (e) {
            const platformSpecific = action.input[platform] as { rollback?: boolean } | undefined;
            const shouldRollback = platformSpecific?.rollback ?? action.input.rollback;
            if (shouldRollback && processedPlatforms.length > 0) {
                logger.warn(`⚠️ Upload to ${PlatformType.friendlyNameOf(platform)} failed. Rolling back previously published releases...`);
                await rollbackAll(published, logger);
            }
            errors.append(e, options.failMode ?? FailMode.FAIL);
        }
    }

    if (processedPlatforms.length) {
        logger.info(`🎉 Successfully published the assets to ${processedPlatforms.map(p => PlatformType.friendlyNameOf(p)).join(", ")}`);
    } else if (!errors.hasErrors) {
        logger.warn("⚠️ No valid platform tokens found in your config. To publish your project, please add the required access tokens for the desired platforms. Assets will not be published without them. Refer to the documentation for assistance in setting up your tokens.");
    }

    errors.throwIfHasErrors();
}

/**
 * Rolls back all previously published releases across platforms.
 *
 * @param published - A map of platform types to the uploader and the report of a previously successful upload.
 * @param logger - The logger to use for logging messages.
 */
async function rollbackAll(published: Map<PlatformType, { uploader: PlatformUploader<GenericPlatformUploadRequest, unknown>; report: unknown }>, logger: Logger): Promise<void> {
    for (const [platform, { uploader, report }] of published) {
        try {
            await uploader.rollback(report);
        } catch (e) {
            logger.warn(`⚠️ Failed to roll back ${PlatformType.friendlyNameOf(platform)}: ${e}`);
        }
    }
}

/**
 * Fills in the default values for the specified options.
 *
 * @param options - The options to fill in the default values for.
 * @param platform - The target platform.
 * @param githubContext - The GitHub context.
 * @param reader - The metadata reader.
 *
 * @returns A promise that resolves to the options with default values filled in.
 */
async function fillInDefaultValues<T extends McPublishInput[P], P extends PlatformType>(options: T, platform: P, githubContext: GitHubContext, reader?: LoaderMetadataReader): Promise<T> {
    const patternList = getFilePatterns(options.files);
    ArgumentError.throwIfNullOrEmpty(options.files, "options.files", patternList.length
        ? `No files found for the specified glob(s): ${patternList.join(", ")}. Please ensure the glob(s) are correct and files matching the pattern exist in the specified directory.`
        : "No files were specified to upload.");

    options = { ...options };
    const primaryFile = options.files[0];
    const metadata = await reader?.readMetadataFile(primaryFile.path).catch(() => undefined as LoaderMetadata);

    const gameVersionProvider = getGameVersionProviderByName(metadata?.gameName || MINECRAFT);
    const wrappedGameVersions = options.gameVersions?.length ? options.gameVersions : (metadata?.gameVersions || []);
    const gameVersions = await gameVersionProvider?.(wrappedGameVersions);
    const unwrappedGameVersions = gameVersions ? GameVersionFilter.filter(gameVersions, options.gameVersionFilter).map(x => x.id) : wrappedGameVersions;

    (options as UnionToIntersection<McPublishInput[PlatformType]>).id ||= metadata?.getProjectId(platform) || "";
    options.version ||= githubContext.version || metadata?.version;
    options.versionType ||= VersionType.parseFromFileName(metadata?.version || primaryFile.name);
    if (platform !== PlatformType.GITHUB) {
        options.name ??= githubContext.payload.release?.name || options.version;
    }
    options.changelog ??= githubContext.payload.release?.body || "";
    options.loaders ??= metadata?.loaders || [];
    options.environment ||= metadata?.environment;
    options.dependencies ??= metadata?.dependencies || [];
    options.gameVersions = unwrappedGameVersions;

    return options;
}

/**
 * Initializes the action.
 *
 * @param path - The path to the action's metadata file.
 * @param env - The environment variables.
 *
 * @returns A promise that resolves to the initialized action.
 */
async function initializeAction(path: PathLike, env?: Record<string, string>): Promise<Action> {
    ArgumentNullError.throwIfNull(path, "path");
    FileNotFoundError.throwIfNotFound(path);

    const config = {
        pathParser: SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER,
        moduleLoader: DYNAMIC_MODULE_LOADER,

        getOutput: (name: string) => getActionOutput(name, env),
        setOutput: (name: string, value: unknown) => setActionOutput(name, value, env),
    };

    const metadata = await parseActionMetadataFromFile(path);
    const input = await getAllActionInputsAsObjectUsingMetadata(metadata, config, env) as McPublishInput;
    const output = createActionOutputControllerUsingMetadata(metadata, config) as McPublishOutput;

    return { input, output };
}
