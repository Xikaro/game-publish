import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Specifies the game environments supported by a mod.
 */
enum CurseForgeEnvironmentTypeValues {
    /**
     * The mod supports the client environment.
     */
    CLIENT = "Client",

    /**
     * The mod supports the server environment.
     */
    SERVER = "Server",
}

/**
 * Options for configuring the behavior of the `CurseForgeEnvironmentType` enum.
 */
const CurseForgeEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,
};

/**
 * Converts a {@link CurseForgeEnvironmentType} to a {@link LoaderEnvironmentType}.
 *
 * @param environment - The {@link CurseForgeEnvironmentType} to convert.
 *
 * @returns The corresponding {@link LoaderEnvironmentType}.
 */
function toLoaderEnvironmentType(environment: CurseForgeEnvironmentType): LoaderEnvironmentType {
    switch (environment) {
        case CurseForgeEnvironmentType.CLIENT:
            return LoaderEnvironmentType.CLIENT_REQUIRED;
        case CurseForgeEnvironmentType.SERVER:
            return LoaderEnvironmentType.SERVER_REQUIRED;
        default:
            return LoaderEnvironmentType.UNKNOWN;
    }
}

/**
 * Converts a {@link LoaderEnvironmentType} to a {@link CurseForgeEnvironmentType}.
 *
 * @param environment - The {@link LoaderEnvironmentType} to convert.
 *
 * @returns The corresponding {@link CurseForgeEnvironmentType}.
 */
function fromLoaderEnvironmentType(environment: LoaderEnvironmentType): CurseForgeEnvironmentType[] {
    return LoaderEnvironmentType.supportsClient(environment)
        ? (LoaderEnvironmentType.supportsServer(environment) ? [CurseForgeEnvironmentType.CLIENT, CurseForgeEnvironmentType.SERVER] : [CurseForgeEnvironmentType.CLIENT])
        : (LoaderEnvironmentType.supportsServer(environment) ? [CurseForgeEnvironmentType.SERVER] : []);
}

/**
 * A collection of methods to work with `CurseForgeEnvironmentType`.
 */
const CurseForgeEnvironmentTypeMethods = {
    toLoaderEnvironmentType,
    fromLoaderEnvironmentType,
};

/**
 * Specifies the game environments supported by a mod.
 */
export const CurseForgeEnvironmentType = Enum.create(
    CurseForgeEnvironmentTypeValues,
    CurseForgeEnvironmentTypeOptions,
    CurseForgeEnvironmentTypeMethods,
);

/**
 * Specifies the game environments supported by a mod.
 */
export type CurseForgeEnvironmentType = Enum<typeof CurseForgeEnvironmentTypeValues>;
