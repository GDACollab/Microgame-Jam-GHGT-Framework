const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
    mode: "production",
    plugins: [new HtmlWebpackPlugin({template: 'Web/index.html'})/*, new MiniCssExtractPlugin()*/, new CopyPlugin({
        patterns: [
            {from: "Web/jam-version-assets/config.ini", to: "jam-version-assets/config.ini"},
            {from: "Web/globals.js", to: "globals.js"},
            {from: "jam-version-assets/*.css", context: "Web/"},
            {from: "Web/stylesheet.css", to: "stylesheet.css"},
            {from: "gameinterface.js", context: "Web/"}
        ]
    })],
    entry: {
        main: './Web/main.js', 
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        assetModuleFilename: '[hash][ext][query]',
        clean: {
            keep: /jam-version-assets/,
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: "ignore-loader"
            }
        ]
    }
    /*module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {url: false}},
                  ]
            }
        ]
    }*/
};