// docs-site/src/shared/brandLogos.js
// Centralized brand logo imports from @lift/ds-assets.
// Each entry maps a brand ID to its Positive SVG string variant.
// Brands without a logo in ds-assets (e.g. estacio-ct) are omitted —
// when BRAND_LOGOS[brandId] is undefined, consumers should display only the text name.

import { Positive as EstacioPositive } from '@lift/ds-assets/brands/estacio/logos/';
import { Positive as WydenPositive } from '@lift/ds-assets/brands/wyden/logos/';
import { Positive as YduqsPositive } from '@lift/ds-assets/brands/yduqs/logos/';
import { Positive as IbmecPositive } from '@lift/ds-assets/brands/ibmec/logos/';
import { Positive as IdomedPositive } from '@lift/ds-assets/brands/idomed/logos/';
import { Positive as DamasioPositive } from '@lift/ds-assets/brands/damasio/logos/';
import { Positive as EnsinemePositive } from '@lift/ds-assets/brands/ensineme/logos/';

/**
 * Mapa de logos por brand ID.
 * Cada entrada contém a variante `positive` como string SVG.
 * Brands sem logo no ds-assets (ex: estacio-ct) não possuem entrada.
 *
 * Nota: a chave `ensine-me` do BRANDS map corresponde à pasta `ensineme`
 * no ds-assets (sem hífen). O mapa usa `ensineme` como chave — consumidores
 * devem mapear `ensine-me` → `ensineme` ao buscar logos.
 *
 * @type {Record<string, { positive: string }>}
 */
export const BRAND_LOGOS = {
  estacio:  { positive: EstacioPositive },
  wyden:    { positive: WydenPositive },
  yduqs:    { positive: YduqsPositive },
  ibmec:    { positive: IbmecPositive },
  idomed:   { positive: IdomedPositive },
  damasio:  { positive: DamasioPositive },
  ensineme: { positive: EnsinemePositive },
};
