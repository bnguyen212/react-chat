var express = require('express');
var path = require('path');
var webpack = require('webpack');
var webpackMiddleware = require("webpack-dev-middleware");
var config = require('./webpack.config');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var compiler = webpack(config);
app.use(webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}));
app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.redirect('index.html');
});

io.on('connection', function (socket) {
  console.log('connected');
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Started, listening on port ', port);
});
