module.exports = {
	entry: __dirname + "/src/js/index.js",
	output: {
		path: __dirname + "/dist",
		publicPath: "/dist/",
		filename: "bundle.js"
	},
	module: {
		rules: [
			{
				test: /src\/\.js$/,
				exclude: /node_modules/,
				use: "babel-loader"
			}
		]
	}
}
