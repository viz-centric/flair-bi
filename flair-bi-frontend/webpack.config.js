const path = require('path');
const ROOT = path.resolve(__dirname, 'src');
const devMode = process.env.NODE_ENV !== 'production'
const webpack = require('webpack');

/**
 * Webpack Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: ROOT,

    resolve: {
        extensions: ['.js'],
        alias: {
            'angular-split-pane': path.resolve(__dirname, './node_modules/@shagstrom/angular-split-pane/angular-split-pane.js'),
            'gridstack-angular': path.resolve(__dirname, './node_modules/gridstack-angular/dist/gridstack-angular.min.js'),
            'i18n': path.resolve(__dirname, './src/i18n'),
            'content': path.resolve(__dirname, './src/content')
        }
    },

    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },

            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            publicPath: 'content/images'
                        }
                    }
                ]
            },
            {
                test: /\.(svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[ext]',
                            publicPath: 'content/svgs'
                        }
                    }
                ]
            },
            {
                test: /\.(json)$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        outputPath: 'i18n'
                    }
                }]
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: 'content/fonts'
                        }
                    }
                ]
            },
            {
                test: /.html$/,
                exclude: /index.html$/,
                use: 'html-loader'
            },
            {
                test: require.resolve('tinycolor2'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'tinycolor'
                    }
                ]
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'AngularJS - Webpack',
            template: 'index.html',
            inject: true
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            d3: 'd3',
            topojson: 'topojson'
        }),
        new CopyWebpackPlugin([
            {from: 'i18n', to: 'i18n'},
            {from: 'content', to: 'content'}
        ])
    ],

    entry: './index.js'
};
