const path = require('path');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');
const DESTINATION = path.resolve(__dirname, '.tmp');

const conf = {
    server: 'http://localhost:8002'
};


module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-source-map',
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, ".tmp"),
        compress: true,
        port: 9000,
        proxy: {
            '/fbiengine/api': conf.server,
            '/api': conf.server,
            '/management': conf.server,
            '/swagger-resources': conf.server,
            '/v2/api-docs': conf.server,
            '/h2-console': conf.server
        }
    },

    output: {
        path: DESTINATION,
        filename: 'js/index.js',
        publicPath: '/'
    },
});
