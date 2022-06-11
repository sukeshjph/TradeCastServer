const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  devtool: "source-map",
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "bundle.js",
  },
};
