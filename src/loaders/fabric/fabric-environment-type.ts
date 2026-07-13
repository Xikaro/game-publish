import { LoaderEnvironmentType } from "@/loaders/loader-environment-type";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different environments that a Fabric mod can run on.
 */
enum FabricEnvironmentTypeValues {
    /**
     * Runs only on the client side.
     */
    CLIENT = "client",

    /**
     * Runs only on the server side.
     */
    SERVER = "server",

    /**
     * Runs on both the client and server side.
     */
    BOTH = "*",
}

/**
 * Options for configuring the behavior of the `FabricEnvironmentType` enum.
 */
const FabricEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,
};

/**
 * Converts a {@link FabricEnvironmentType} to a {@link LoaderEnvironmentType}.
 *
 * @param environment - The {@link FabricEnvironmentType} to convert.
 *
 * @returns The corresponding {@link LoaderEnvironmentType}, or `undefined` if the value is invalid.
 */
function toLoaderEnvironmentType(environment: FabricEnvironmentType): LoaderEnvironmentType | undefined {
    switch (environment) {
        case FabricEnvironmentType.CLIENT:
            return LoaderEnvironmentType.CLIENT_REQUIRED;
        case FabricEnvironmentType.SERVER:
            return LoaderEnvironmentType.SERVER_REQUIRED;
        case FabricEnvironmentType.BOTH:
            return LoaderEnvironmentType.BOTH;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link LoaderEnvironmentType} to a {@link FabricEnvironmentType}.
 *
 * @param environment - The {@link LoaderEnvironmentType} to convert.
 *
 * @returns The corresponding {@link FabricEnvironmentType}, or `undefined` if the value is invalid.
 */
function fromLoaderEnvironmentType(environment: LoaderEnvironmentType): FabricEnvironmentType | undefined {
    return LoaderEnvironmentType.supportsClient(environment)
        ? (LoaderEnvironmentType.supportsServer(environment) ? FabricEnvironmentType.BOTH : FabricEnvironmentType.CLIENT)
        : (LoaderEnvironmentType.supportsServer(environment) ? FabricEnvironmentType.SERVER : undefined);
}

/**
 * A collection of methods to work with `FabricEnvironmentType`.
 */
const FabricEnvironmentTypeMethods = {
    toLoaderEnvironmentType,
    fromLoaderEnvironmentType,
};

/**
 * Represents the different environments that a Fabric mod can run on.
 */
export const FabricEnvironmentType = Enum.create(
    FabricEnvironmentTypeValues,
    FabricEnvironmentTypeOptions,
    FabricEnvironmentTypeMethods,
);

/**
 * Represents the different environments that a Fabric mod can run on.
 */
export type FabricEnvironmentType = Enum<typeof FabricEnvironmentTypeValues>;
