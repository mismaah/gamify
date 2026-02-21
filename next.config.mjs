// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  output: "standalone",
  // Transpile antd and all rc-* ESM packages so they resolve correctly during SSR
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/cssinjs",
    "@ant-design/cssinjs-utils",
    "@rc-component/util",
    "@rc-component/trigger",
    "@rc-component/tooltip",
    "@rc-component/portal",
    "@rc-component/overflow",
    "@rc-component/motion",
    "@rc-component/mutate-observer",
    "@rc-component/context",
    "@rc-component/resize-observer",
    "@rc-component/color-picker",
    "@rc-component/tour",
    "@rc-component/notification",
    "@rc-component/mini-decimal",
    "@rc-component/qrcode",
    "@rc-component/async-validator",
    "@rc-component/cascader",
    "@rc-component/checkbox",
    "@rc-component/collapse",
    "@rc-component/dialog",
    "@rc-component/drawer",
    "@rc-component/dropdown",
    "@rc-component/form",
    "@rc-component/image",
    "@rc-component/input",
    "@rc-component/input-number",
    "@rc-component/mentions",
    "@rc-component/menu",
    "@rc-component/pagination",
    "@rc-component/picker",
    "@rc-component/progress",
    "@rc-component/rate",
    "@rc-component/segmented",
    "@rc-component/select",
    "@rc-component/slider",
    "@rc-component/steps",
    "@rc-component/switch",
    "@rc-component/table",
    "@rc-component/tabs",
    "@rc-component/textarea",
    "@rc-component/tree",
    "@rc-component/tree-select",
    "@rc-component/upload",
    "@rc-component/virtual-list",
    "rc-cascader",
    "rc-checkbox",
    "rc-collapse",
    "rc-dialog",
    "rc-drawer",
    "rc-dropdown",
    "rc-field-form",
    "rc-image",
    "rc-input",
    "rc-input-number",
    "rc-mentions",
    "rc-menu",
    "rc-motion",
    "rc-notification",
    "rc-overflow",
    "rc-pagination",
    "rc-picker",
    "rc-progress",
    "rc-rate",
    "rc-resize-observer",
    "rc-segmented",
    "rc-select",
    "rc-slider",
    "rc-steps",
    "rc-switch",
    "rc-table",
    "rc-tabs",
    "rc-textarea",
    "rc-tooltip",
    "rc-tree",
    "rc-tree-select",
    "rc-upload",
    "rc-util",
    "rc-virtual-list",
  ],
  // ignoreBuildErrors: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Prisma v7 with adapter-pg must not be bundled by webpack.
  // Keep these as runtime node_modules so the adapter (not the engine binary) is used.
  serverExternalPackages: ["@prisma/adapter-pg", "@prisma/client"],
};
export default config;
