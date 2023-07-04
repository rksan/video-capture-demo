const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  // github pages
  outputDir: "docs",
  assetsDir: "./",
  publicPath: "./",
  transpileDependencies: true,
  chainWebpack: (config) =>
    config.plugin("feature-flags").use(webpack.DefinePlugin, [
      {
        __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
      },
    ]),
});
