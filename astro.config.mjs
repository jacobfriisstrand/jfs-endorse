import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import icon from "astro-icon";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  image: {
    domains: ["datocms-assets.com"],
  },
  integrations: [react(), icon()],
  devToolbar: {
    enabled: false,
  },
  output: "server",
  adapter: vercel(),
});
