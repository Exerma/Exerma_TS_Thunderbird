/**
 *----------------------------------------------------------------------------
 * (c) Patrick Seuret, 2024
 * ----------------------------------------------------------------------------
 * webpack.config.js
 * ----------------------------------------------------------------------------
 * This is the declaration for webpack package builder
 * Source: https://webpack.js.org/
 * 
 * Information about debug mode:
 * https://stackoverflow.com/questions/37208950/what-are-the-differences-between-webpack-development-and-production-build-modes
 *
 * Versions:
 *   2024-08-10: First version
 *
 */

const defaultMode = "none";

const path = require("path");
const outputPath = path.resolve(__dirname, "./lib/");

const defaultRules = [
    {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
    }
];

const defaultExtensions = [".tsx", ".ts", ".js"];

var webpack = require('webpack');

module.exports = [
    {
        name: 'module',
        mode: defaultMode,
        entry: {
            index: './src/index.ts'
        },
        module: {
            rules: defaultRules,
        },
        resolve: {
            extensions: defaultExtensions,
        },
        output: {
            path: outputPath,
        },
        /* devtool: 'source-map' */
    }
]
