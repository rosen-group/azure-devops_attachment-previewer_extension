const path = require("path");
const fs = require("fs");

const CopyWebpackPlugin = require("copy-webpack-plugin");

// webpack entry points. Mapping from resulting bundle name to the source file
// entry.
const entries = {};

// loop through subfolders in the "modules" folder and add an entry for each one
const base = path.join(__dirname, "src/Modules");
fs.readdirSync(base).forEach(directory => {
    if (!fs.statSync(path.join(base, directory)).isDirectory()) return;

    entries[directory] = "./" + path.relative(process.cwd(), path.join(base, directory, directory));
});

module.exports = {
    entry: entries,
    output: {
        filename: "[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/,
                loader: "file-loader"
            },
            {
                test: /\.woff$/,
                type: "asset/inline"
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
           patterns: [
               { from: "**/*.html", context: "src/Modules" }
           ]
        })
    ]
};
