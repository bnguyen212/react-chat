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
  // console.log('connectedddddddd');
  socket.on('username', function(username) {
    console.log('Welcome ', username);
    if (!username || !username.trim()) {
      return socket.emit('errorMessage', 'No username!');
    }
    socket.username = String(username);
  });

  socket.on('room', function(requestedRoom) {
    if (!socket.username) {
      return socket.emit('errorMessage', 'Username not set!');
    }
    if (!requestedRoom) {
      return socket.emit('errorMessage', 'No room!');
    }
    if (socket.room) {
      socket.leave(socket.room);
    }

    socket.room = requestedRoom;
    socket.join(requestedRoom, function() {
      console.log('successfully joined ', requestedRoom);
      socket.to(requestedRoom).emit('message', {
        username: 'System',
        content: socket.username + ' has joined'
      });
    });
  });

  socket.on('message', function(message) {
    console.log('message: ', message);
    if (!socket.room) {
      return socket.emit('errorMessage', 'No rooms joined!');
    }
    console.log("HIT HERE!!!!!");
    socket.to(socket.room).emit('message', {
      username: socket.username,
      content: message
    });
  })
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Started, listening on port ', port);
});
