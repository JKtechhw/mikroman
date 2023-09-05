const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        installation: ['./app/installation/js/installation.js'],
        login: ['./app/admin/js/login.js'],
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '..', 'public', 'js'),
        filename: '[name].js',
    },
    plugins: [
        require("autoprefixer"),
        require("postcss-preset-env"),
        new MiniCssExtractPlugin({
            filename: "../css/[name].css"
        }),
    ],
    module: {
        rules: [
            {
                //Resolve scss, sass, css
                test: /\.(s[ac]|c)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                    "autoprefixer"
                                ]
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                    },
                ]
            },
        ]
    },
}