import { PathLike } from "node:fs";
import { parse as parseToml } from "toml";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderType } from "../loader-type";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { NeoForgeMetadata } from "./neoforge-metadata";
import { NEOFORGE_MODS_TOML, MODS_TOML } from "./raw-neoforge-metadata";

/**
 * A metadata reader that is able to read NeoForge mod metadata from a zipped file.
 */
export class NeoForgeMetadataReader implements LoaderMetadataReader<NeoForgeMetadata> {
    /**
     * @inheritdoc
     */
    async readMetadataFile(path: PathLike): Promise<NeoForgeMetadata> {
        try {
            // Prefer `neoforge.mods.toml` over `mods.toml`.
            const metadataText = await readAllZippedText(path, NEOFORGE_MODS_TOML);
            return NeoForgeMetadata.from(parseToml(metadataText));
        } catch {
            const metadataText = await readAllZippedText(path, MODS_TOML);
            const metadata = NeoForgeMetadata.from(parseToml(metadataText));
            if (metadata.dependencies.some(x => x.id === LoaderType.FORGE)) {
                throw new Error("A NeoForge metadata file cannot contain a 'forge' dependency");
            }

            return metadata;
        }
    }
}
