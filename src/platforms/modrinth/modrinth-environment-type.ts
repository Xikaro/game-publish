import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Specifies the game environments supported by a mod.
 */
enum ModrinthEnvironmentTypeValues {
    /**
     * The supported environment is unknown or has not been specified.
     */
    UNKNOWN = "unknown",

    /**
     * Requires installation on both the client and the server to function correctly.
     */
    CLIENT_AND_SERVER = "client_and_server",

    /**
     * All functionality is done client-side and is compatible with vanilla servers.
     */
    CLIENT_ONLY = "client_only",

    /**
     * Primarily functions on the client but can optionally be installed on the server.
     */
    CLIENT_ONLY_SERVER_OPTIONAL = "client_only_server_optional",

    /**
     * Only functions in Singleplayer or when not connected to a Multiplayer server.
     */
    SINGLEPLAYER_ONLY = "singleplayer_only",

    /**
     * All functionality is done server-side and is compatible with vanilla clients.
     */
    SERVER_ONLY = "server_only",

    /**
     * Primarily functions on the server but can optionally be installed on the client.
     */
    SERVER_ONLY_CLIENT_OPTIONAL = "server_only_client_optional",

    /**
     * Only functions on a dedicated server and cannot be installed on the client.
     */
    DEDICATED_SERVER_ONLY = "dedicated_server_only",

    /**
     * Can be installed on either the client or the server.
     */
    CLIENT_OR_SERVER = "client_or_server",

    /**
     * Can be installed on either the client or the server, but provides the best experience when installed on both.
     */
    CLIENT_OR_SERVER_PREFERS_BOTH = "client_or_server_prefers_both",
}

/**
 * Options for configuring the behavior of the `ModrinthEnvironmentType` enum.
 */
const ModrinthEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the environment string.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Converts a {@link ModrinthEnvironmentType} to a {@link LoaderEnvironmentType}.
 *
 * @param environment - The {@link ModrinthEnvironmentType} to convert.
 *
 * @returns The corresponding {@link LoaderEnvironmentType}.
 */
function toLoaderEnvironmentType(environment: ModrinthEnvironmentType): LoaderEnvironmentType {
    switch (environment) {
        case ModrinthEnvironmentType.CLIENT_AND_SERVER:
            return LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_REQUIRED;
        case ModrinthEnvironmentType.CLIENT_ONLY:
            return LoaderEnvironmentType.CLIENT_REQUIRED;
        case ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL:
            return LoaderEnvironmentType.CLIENT_REQUIRED | LoaderEnvironmentType.SERVER_OPTIONAL;
        case ModrinthEnvironmentType.SINGLEPLAYER_ONLY:
            return LoaderEnvironmentType.SINGLEPLAYER_REQUIRED;
        case ModrinthEnvironmentType.SERVER_ONLY:
            return LoaderEnvironmentType.SERVER_REQUIRED;
        case ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL:
            return LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_REQUIRED;
        case ModrinthEnvironmentType.DEDICATED_SERVER_ONLY:
            return LoaderEnvironmentType.DEDICATED_SERVER_REQUIRED;
        case ModrinthEnvironmentType.CLIENT_OR_SERVER:
            return LoaderEnvironmentType.CLIENT_OPTIONAL | LoaderEnvironmentType.SERVER_OPTIONAL;
        case ModrinthEnvironmentType.CLIENT_OR_SERVER_PREFERS_BOTH:
            return LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SERVER_PREFERRED;
        default:
            return LoaderEnvironmentType.UNKNOWN;
    }
}

/**
 * Converts a {@link LoaderEnvironmentType} to a {@link ModrinthEnvironmentType}.
 *
 * @param environment - The {@link LoaderEnvironmentType} to convert.
 *
 * @returns The corresponding {@link ModrinthEnvironmentType}.
 */
function fromLoaderEnvironmentType(environment: LoaderEnvironmentType): ModrinthEnvironmentType {
    const preferredFlags = LoaderEnvironmentType.CLIENT_PREFERRED | LoaderEnvironmentType.SERVER_PREFERRED;
    if ((environment & preferredFlags) === preferredFlags) {
        return ModrinthEnvironmentType.CLIENT_OR_SERVER_PREFERS_BOTH;
    }

    if (!(environment ^ LoaderEnvironmentType.DEDICATED_SERVER)) {
        return ModrinthEnvironmentType.DEDICATED_SERVER_ONLY;
    }

    if (!(environment ^ LoaderEnvironmentType.SINGLEPLAYER)) {
        return ModrinthEnvironmentType.SINGLEPLAYER_ONLY;
    }

    if (environment & LoaderEnvironmentType.CLIENT_OPTIONAL) {
        return (environment & LoaderEnvironmentType.SERVER_OPTIONAL)
            ? ModrinthEnvironmentType.CLIENT_OR_SERVER : LoaderEnvironmentType.supportsServer(environment)
            ? ModrinthEnvironmentType.SERVER_ONLY_CLIENT_OPTIONAL : ModrinthEnvironmentType.CLIENT_ONLY;
    }

    if (environment & LoaderEnvironmentType.SERVER_OPTIONAL) {
        return LoaderEnvironmentType.supportsClient(environment) ? ModrinthEnvironmentType.CLIENT_ONLY_SERVER_OPTIONAL : ModrinthEnvironmentType.SERVER_ONLY;
    }

    if (LoaderEnvironmentType.supportsClient(environment)) {
        return LoaderEnvironmentType.supportsServer(environment) ? ModrinthEnvironmentType.CLIENT_AND_SERVER : ModrinthEnvironmentType.CLIENT_ONLY;
    }

    return LoaderEnvironmentType.supportsServer(environment) ? ModrinthEnvironmentType.SERVER_ONLY : ModrinthEnvironmentType.UNKNOWN;
}

/**
 * A collection of methods to work with `ModrinthEnvironmentType`.
 */
const ModrinthEnvironmentTypeMethods = {
    toLoaderEnvironmentType,
    fromLoaderEnvironmentType,
};

/**
 * Specifies the game environments supported by a mod.
 */
export const ModrinthEnvironmentType = Enum.create(
    ModrinthEnvironmentTypeValues,
    ModrinthEnvironmentTypeOptions,
    ModrinthEnvironmentTypeMethods,
);

/**
 * Specifies the game environments supported by a mod.
 */
export type ModrinthEnvironmentType = Enum<typeof ModrinthEnvironmentTypeValues>;
