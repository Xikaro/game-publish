import { createEqualityComparer } from "@/utils/comparison";
import { Enum } from "@/utils/enum";
import { DynamicEnumOptions } from "@/utils/enum/dynamic-enum";
import { stringEquals } from "@/utils/string-utils";

/**
 * Represents the environments that a mod might support.
 */
enum LoaderEnvironmentTypeValues {
    /**
     * Indicates that no environment has been specified.
     */
    UNKNOWN = 0,

    /**
     * Indicates that the mod is required on the client.
     */
    CLIENT_REQUIRED = 1,

    /**
     * Indicates that the mod is required on the client.
     */
    CLIENT = CLIENT_REQUIRED,

    /**
     * Indicates that the mod is optional on the client.
     */
    CLIENT_OPTIONAL = 2,

    /**
     * Indicates that the mod is optional on the client.
     */
    "CLIENT?" = CLIENT_OPTIONAL,

    /**
     * Indicates that the mod is optional on the client, but is recommended to be installed.
     */
    CLIENT_PREFERRED = CLIENT_REQUIRED | CLIENT_OPTIONAL,

    /**
     * Indicates that the mod is optional on the client, but is recommended to be installed.
     */
    "CLIENT*" = CLIENT_PREFERRED,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    SINGLEPLAYER_REQUIRED = 4,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    SINGLEPLAYER = SINGLEPLAYER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    SINGLEPLAYER_OPTIONAL = SINGLEPLAYER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    SINGLEPLAYER_PREFERRED = SINGLEPLAYER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    "SINGLEPLAYER?" = SINGLEPLAYER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the integrated server side.
     */
    "SINGLEPLAYER*" = SINGLEPLAYER_REQUIRED,

    /**
     * Indicates that the mod is required on the server.
     */
    SERVER_REQUIRED = 8,

    /**
     * Indicates that the mod is required on the server.
     */
    SERVER = SERVER_REQUIRED,

    /**
     * Indicates that the mod is optional on the server.
     */
    SERVER_OPTIONAL = 16,

    /**
     * Indicates that the mod is optional on the server.
     */
    "SERVER?" = SERVER_OPTIONAL,

    /**
     * Indicates that the mod is optional on the server, but is recommended to be installed.
     */
    SERVER_PREFERRED = SERVER_REQUIRED | SERVER_OPTIONAL,

    /**
     * Indicates that the mod is optional on the server, but is recommended to be installed.
     */
    "SERVER*" = SERVER_PREFERRED,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    DEDICATED_SERVER_REQUIRED = 32,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    DEDICATED_SERVER = DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    DEDICATED_SERVER_OPTIONAL = DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    DEDICATED_SERVER_PREFERRED = DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    "DEDICATED_SERVER?" = DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is intended to be installed on the dedicated server side.
     */
    "DEDICATED_SERVER*" = DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is required in every supported environment.
     */
    ALL = CLIENT_REQUIRED | SERVER_REQUIRED | SINGLEPLAYER_REQUIRED | DEDICATED_SERVER_REQUIRED,

    /**
     * Indicates that the mod is required in every supported environment.
     */
    BOTH = ALL,

    /**
     * Indicates that the mod is required in every supported environment.
     */
    "*" = ALL,

    /**
     * Indicates that the mod supports every environment.
     */
    ANY = CLIENT_PREFERRED | SERVER_PREFERRED | SINGLEPLAYER_PREFERRED | DEDICATED_SERVER_PREFERRED,
}

/**
 * Options for configuring the behavior of the `LoaderEnvironmentType` enum.
 */
const LoaderEnvironmentTypeOptions: DynamicEnumOptions = {
    /**
     * `LoaderEnvironmentType` is a flag-based enum.
     */
    hasFlags: true,

    /**
     * The equality comparer used to compare enum keys.
     */
    comparer: createEqualityComparer((x, y) => stringEquals(x, y, { ignoredCharacters: /^[^\p{L}\d?*]$/u, ignoreCase: true })),
};

/**
 * Determines whether the specified environment includes client support.
 *
 * @param environment - The environment to check.
 *
 * @returns `true` if the specified environment includes client support; otherwise, `false`.
 */
function supportsClient(environment: LoaderEnvironmentType): boolean {
    const clientFlags = LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SINGLEPLAYER_REQUIRED;
    return (environment & clientFlags) !== 0;
}

/**
 * Determines whether the specified environment includes server support.
 *
 * @param environment - The environment to check.
 *
 * @returns `true` if the specified environment includes server support; otherwise, `false`.
 */
function supportsServer(environment: LoaderEnvironmentType): boolean {
    const serverFlags = LoaderEnvironmentType.SERVER_REQUIRED | LoaderEnvironmentType.SERVER_OPTIONAL | LoaderEnvironmentType.SERVER_PREFERRED | LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED;
    return (environment & serverFlags) !== 0;
}

/**
 * A collection of methods to work with `LoaderEnvironmentType`.
 */
const LoaderEnvironmentTypeMethods = {
    supportsClient,
    supportsServer,
};

/**
 * Represents the environments that a mod might support.
 */
export const LoaderEnvironmentType = Enum.create(
    LoaderEnvironmentTypeValues,
    LoaderEnvironmentTypeOptions,
    LoaderEnvironmentTypeMethods,
);

/**
 * Represents the environments that a mod might support.
 */
export type LoaderEnvironmentType = Enum<typeof LoaderEnvironmentTypeValues>;
