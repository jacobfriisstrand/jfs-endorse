/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly DATO_CMS_TOKEN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
