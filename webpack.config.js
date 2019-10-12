const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const HtmlWebpackMultiBuildPlugin = require("html-webpack-multi-build-plugin");

const babelConfig = require("./babel.config.js");

const genConfig = (modernMode, mode) => {
  let config = {
    mode,
    entry: {
      modern: "./src/index.js",
      legacy: ["./src/legacy-polyfills.js", "./src/index.js"]
    }[modernMode],
    output: {
      path: path.join(__dirname, "dist"),
      filename: `./app.${modernMode}.js`,
      chunkFilename: `chunk/[name].${modernMode}.js`
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 3000,
      watchContentBase: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: "./src/index.ejs",
        title: "s2.m98.be"
      }),
      new HtmlWebpackMultiBuildPlugin(),
      new webpack.EnvironmentPlugin(["NODE_ENV"])
    ],
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            ...babelConfig.env[modernMode]
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        react: "preact/compat",
        "react-dom": "preact/compat"
      }
    },
    optimization: {
      splitChunks: false,
      minimizer: [
        new TerserWebpackPlugin({
          extractComments: /(?:^(?:\**!|@preserve|@license|@cc_on))|license|copyright/i
        })
      ]
    },
    stats: {
      excludeModules: [/\(webpack\)|lodash/]
    }
  };
  if (mode === "development") {
    //config = merge(config, { optimization: { concatenateModules: false } });
  }
  if (mode === "production") {
    config = merge(config, {
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          generateStatsFile: true,
          reportFilename: `report.${modernMode}.html`,
          statsFilename: `stats.${modernMode}.json`
        })
      ]
    });
  }
  return config;
};

module.exports = (env, { mode = "production" }) => {
  if (process.env.NODE_ENV) {
    mode = process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = mode;
  }
  return [genConfig("modern", mode), genConfig("legacy", mode)];
};
