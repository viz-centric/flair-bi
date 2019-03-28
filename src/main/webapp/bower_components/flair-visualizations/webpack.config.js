const path = require('path');

module.exports = {
    mode: 'development',

    // Entry point for the Javascript files
    entry: {
        main: './js/main.js'
    },

    // Output file where the bundled Javascript is to be dumped
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        library: 'flairVisualizations'
    },

    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.ttf$/,
            use: [{
                loader: 'ttf-loader',
                options: {
                    name: './fonts/[hash].[ext]'
                }
            }]
        }]
    }
}
