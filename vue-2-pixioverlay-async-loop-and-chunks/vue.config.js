const path = require('path');

module.exports = {
    outputDir: path.resolve(__dirname, "../site/async-loop-and-chunks"),
    publicPath: process.env.NODE_ENV === 'production' ? '/async-loop-and-chunks' : '/'
}