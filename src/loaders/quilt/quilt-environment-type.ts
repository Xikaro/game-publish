import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different environments that a Quilt mod can run on.
 */
enum QuiltEnvironmentTypeValues {
    /**
     * The physical client.
     */
    CLIENT = "client",

    /**
     * The dedicated server.
     */
    DEDICATED_SERVER = "dedicated_server",

    /**
     * Runs on all environments.
     */
    ALL = "*",
}

/**
 * Options for configuring the behavior of the `QuiltEnvironmentType` enum.
 */
const QuiltEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the filter.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Converts a {@link QuiltEnvironmentType} to a {@link LoaderEnvironmentType}.
 *
 * @param environment - The {@link QuiltEnvironmentType} to convert.
 *
 * @returns The corresponding {@link LoaderEnvironmentType}, or `undefined` if the value is invalid.
 */
function toLoaderEnvironmentType(environment: QuiltEnvironmentType): LoaderEnvironmentType | undefined {
    switch (environment) {
        case QuiltEnvironmentType.CLIENT:
            return LoaderEnvironmentType.CLIENT_REQUIRED;
        case QuiltEnvironmentType.DEDICATED_SERVER:
            return LoaderEnvironmentType.SERVER_REQUIRED;
        case QuiltEnvironmentType.ALL:
            return LoaderEnvironmentType.ALL;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link LoaderEnvironmentType} to a {@link QuiltEnvironmentType}.
 *
 * @param environment - The {@link LoaderEnvironmentType} to convert.
 *
 * @returns The corresponding {@link QuiltEnvironmentType}, or `undefined` if the value is invalid.
 */
function fromLoaderEnvironmentType(environment: LoaderEnvironmentType): QuiltEnvironmentType | undefined {
    return LoaderEnvironmentType.supportsClient(environment)
        ? (LoaderEnvironmentType.supportsServer(environment) ? QuiltEnvironmentType.ALL : QuiltEnvironmentType.CLIENT)
        : (LoaderEnvironmentType.supportsServer(environment) ? QuiltEnvironmentType.DEDICATED_SERVER : undefined);
}

/**
 * A collection of methods to work with `QuiltEnvironmentType`.
 */
const QuiltEnvironmentTypeMethods = {
    toLoaderEnvironmentType,
    fromLoaderEnvironmentType,
};

/**
 * Represents the different environments that a Quilt mod can run on.
 */
export const QuiltEnvironmentType = Enum.create(
    QuiltEnvironmentTypeValues,
    QuiltEnvironmentTypeOptions,
    QuiltEnvironmentTypeMethods,
);

/**
 * Represents the different environments that a Quilt mod can run on.
 */
export type QuiltEnvironmentType = Enum<typeof QuiltEnvironmentTypeValues>;
