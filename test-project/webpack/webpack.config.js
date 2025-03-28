const path = require('path');
const { createMockMiddleware } = require('mock-server-pro');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 8080,
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use(createMockMiddleware({
        base: {
          prefix: '/api',
          prefixConfig: {
            mode: 'auto',
            detectBasePath: true
          }
        },
        modules: {
          dir: path.resolve(__dirname, 'src/mocks'),
          pattern: '**/*.{js,ts}',
          recursive: true
        },
        typescript: {
          sourcemap: true
        }
      }));
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}; 