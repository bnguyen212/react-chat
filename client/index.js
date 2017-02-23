var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "Room1",
      rooms: ["Room1", "Room2", "Room3", "Room4"]
    }
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.state.socket.username = prompt("Insert username!")
      this.setState({
        username: this.state.socket.username
      });
      this.state.socket.emit('username', this.state.username)
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({
      roomName: room
    })
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Room1") }>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={this.state.rooms} room={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} username={this.state.username} room={this.state.roomName} />
      </div>
      );
  }
});


var ChatRoomSelector = React.createClass({
  handleClick: function(name) {
    this.props.onSwitch(name);
  },
  render: function() {
    var tabs = [];
    
    var self = this;

    tabs = self.props.rooms.map(function(room, index) {
      if (room === self.props.room) {
return <li role="presentation" className="active" key={'Room_' + index}><a href="#">Join {room}</a></li>
      }
return <li role="presentation" onClick={self.handleClick.bind(self, room)} key={'Room_' + index}><a href="#">Join {room}</a></li>
    })

    return (
      <div>
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
      </div>
      )
  }
})


var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: [],
      socket: this.props.socket,
      roomName: this.props.room,
      typingUsers: []
    }
  },
  componentDidMount: function() {
    this.state.socket.on('message', function(message){
      this.setState({
        messages: this.state.messages.concat(message)
      })
    }.bind(this));


    this.props.socket.on('typing', function(data) {
      console.log(data);
      this.setState({
        typingUsers: data
      })
    }.bind(this));

  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.room !== this.props.room) {
      this.state.socket.emit('room', nextProps.room)
      this.setState({
        messages: [],
        room: nextProps.room
      });
    }
  },
  getMessage: function(msg) {
    var typingUsers = this.state.typingUsers
    var currentUser = this.props.socket.username
    var newTypingUsers
    if (event.target.value) {
      if (typingUsers.indexOf(currentUser) === -1) {
        newTypingUsers = typingUsers.concat(currentUser)
        this.props.socket.emit('typing', newTypingUsers)
        this.setState({
          typingUsers: newTypingUsers
        });



      }
    } else {
      if (typingUsers.indexOf(currentUser) !== -1) {
        newTypingUsers = typingUsers.filter(function(user) {return user !== currentUser})
        this.props.socket.emit('stop typing', newTypingUsers)
        this.setState({
          typingUsers: newTypingUsers
        });
      }
    }

    var totalMessage = this.state.messages.concat([msg])
      this.setState ({
        messages: totalMessage
      });
  },
  update: function(input) {
    console.log(input);
    console.log(input.target);
    var typingUsers = this.state.typingUsers
    var currentUser = this.props.socket.username
    var newTypingUsers = this.state.socket.username
    if (input.target.value) {
      if (typingUsers.indexOf(currentUser) === -1) {
        newTypingUsers = typingUsers.concat(currentUser)
        this.props.socket.emit('typing', newTypingUsers)
        this.setState({
          typingUsers: newTypingUsers
        });
      }
    } else {
      if (typingUsers.indexOf(currentUser) !== -1) {
        newTypingUsers = typingUsers.filter(function(user) {return user !== currentUser})
        this.props.socket.emit('typing', newTypingUsers)
        this.setState({
          typingUsers: newTypingUsers
        });
      }
    }
    this.setState ({
      message: input.target.value
    })
  },
  send: function(input) {
    input.preventDefault();
    var currentUser = this.props.socket.username
    var message = {
      username: this.state.socket.username, 
      content: this.state.message
    }

    this.props.socket.emit('message', this.state.message)
    var typingUsers = this.state.typingUsers
    if (typingUsers.indexOf(currentUser) !== -1) {
      var newTypingUsers = typingUsers.filter(function(user) {return user !== currentUser})
      this.props.socket.emit('typing', newTypingUsers)
      this.setState({
        typingUsers: newTypingUsers
      });
    }

    this.setState({
      message: "",
      messages: this.state.messages.concat(message)
    })
  },
  render: function() {
    var messages = [];
    messages = this.state.messages.map(function(x, index) {
      return <p key={'message_' + index}>{x.username}: {x.content}</p>
    })
    var typingUsers = [];
    typingUsers = this.state.typingUsers.map(function(x, index){
      return <p key={'typingUsers_' + index}>{x} is typing, everyone stop...</p>
    })
    console.log(this.state.typingUsers)
    return (
      <div>

        {messages}
        
        <form onSubmit={this.send}>
        {typingUsers}
        <input className="form-control" type="text" onChange={this.update} value={this.state.message}/>
        <button type="submit" className="btn btn-default" >Send Message</button>
        </form>
      </div>
      );
  }
});


ReactDOM.render(<App />, document.getElementById('root'));