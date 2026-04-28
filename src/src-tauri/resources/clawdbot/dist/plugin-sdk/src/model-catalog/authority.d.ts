import type { ModelCatalogSource, NormalizedModelCatalogRow } from "./types.js";
export declare function compareModelCatalogSourceAuthority(left: ModelCatalogSource, right: ModelCatalogSource): number;
export declare function mergeModelCatalogRowsByAuthority(rows: Iterable<NormalizedModelCatalogRow>): NormalizedModelCatalogRow[];
