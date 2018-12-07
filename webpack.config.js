const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const devMode = process.env.NODE_ENV !== "production"

module.exports = {
	entry: __dirname + "/src/js/index.js",
	output: {
		path: __dirname + "/dist",
		publicPath: "/dist/",
		filename: "bundle.js"
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css"
		})
	],
	module: {
		rules: [
			{
				test: /src\/\.js$/,
				exclude: /node_modules/,
				use: "babel-loader"
			},
			{
				test: /\.s?[ac]ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{ loader: "css-loader", options: { url: false, sourceMap: true } },
					{ loader: "sass-loader", options: { sourceMap: true } }
				]
			}
		]
	}
}
