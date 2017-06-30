const express           = require('express');
const path              = require('path');
const compress          = require('compression');

// const webpack               = require('webpack');
// const webpackDevMiddleware  = require("webpack-dev-middleware");
// const webpackHotMiddleware  = require('webpack-hot-middleware');
// const config                = require('./webpack.config');

const app               = express();
const server            = require('http').Server(app);
const io                = require('socket.io')(server);

// const compiler = webpack(config);
// app.use(webpackDevMiddleware(compiler, {
//   noInfo: true,
//   publicPath: config.output.publicPath,
//   stats: {
//     colors: true
//   },
//   hot: true,
//   historyApiFallback: true
// }));
// app.use(webpackHotMiddleware(compiler));

// Default routes
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use(compress());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

var roomUsers = {};
var typingPeople = {};


// Socket handler
io.on('connection', socket => {
  console.log('connected');

  socket.on('username', username => {
    if (!username || !username.trim()) {
      return socket.emit('errorMessage', 'No username!');
    }
    var oldUsername = socket.username;
    socket.username = String(username);
  });
  // socket.on('changedusername', username => {
  //   socket.to(socket.room).emit('message', {
  //     username: 'System',
  //     content: `${socket.username} has changed username to: ${username}`
  //   });
  // })
  socket.on('room', requestedRoom => {
    if (!socket.username) {
      return socket.emit('errorMessage', 'Username not set!');
    }
    if (!requestedRoom) {
      return socket.emit('errorMessage', 'No room!');
    }
    if (socket.room) {
      socket.leave(socket.room);
      socket.to(socket.room).emit('message', {
        username: 'System',
        content: `${socket.username} has left :(`
      });
    }
    //remove from old room
    var oldRoomUsers = roomUsers[socket.room]  || [];
    var newOld = oldRoomUsers.slice();
    newOld.splice(oldRoomUsers.indexOf(socket.username), 1);
    roomUsers[socket.room] = newOld;
    io.to(socket.room).emit('updateusers', roomUsers[socket.room]);

    //join new room:
    socket.room = requestedRoom;
    socket.join(requestedRoom, () => {
      console.log('reached room on server');

      socket.to(requestedRoom).emit('message', {
        username: 'System',
        content: `${socket.username} has joined`
      });
      var newRoomUsers = roomUsers[socket.room] || [];
      var newNew = newRoomUsers.slice();
      newNew.push(socket.username);
      roomUsers[socket.room] = newNew;
      io.to(requestedRoom).emit('updateusers', roomUsers[socket.room]);
    });
  });

  socket.on('usernamechange', newUsername => {

    var users = roomUsers[socket.room];
    users.splice(users.indexOf("Guest"), 1);
    users.push(newUsername);
    roomUsers[socket.room] = users;
    io.to(socket.room).emit('updateusers', roomUsers[socket.room])
  });

  socket.on('message', message => {
    if (!socket.room) {
      return socket.emit('errorMessage', 'No rooms joined!');
    }
    // console.log('server received message');
    io.to(socket.room).emit('message', {
      username: socket.username,
      content: message
    });
  });

  //track typing:
  //object with username and timeout key-value pairs

  socket.on('typing', () => {
    if (!socket.room) {
      return socket.emit('errorMessage', 'No rooms joined!');
    }
    // console.log('receives typing');
    socket.to(socket.room).emit('typing', { username: socket.username } );

    //create new timeout
    if (typingPeople[socket.username]) {
      clearTimeout(typingPeople[socket.username]);
    }
    var timeout = setTimeout(() => {
      //stop typing
      socket.to(socket.room).emit('stoptyping', { username: socket.username});
    }, 400);
    typingPeople[socket.username] = timeout;
  });
  socket.on('stoptyping', () => {
    if (!socket.room) {
      return socket.emit('errorMessage', 'No rooms joined!');
    }
    // console.log('receives stop of typing');
    socket.to(socket.room).emit('stoptyping', { username: socket.username });
  });
  socket.on('disconnect', ()  => {
    var oldUsers = roomUsers[socket.room];
    oldUsers.splice(oldUsers.indexOf(socket.username), 1);
    roomUsers[socket.room] = oldUsers;
  })
});



const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
