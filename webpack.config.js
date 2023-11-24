const path = require('path');

module.exports = {
  entry: './path/to/your/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
