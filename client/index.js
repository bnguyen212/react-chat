var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
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
    });
    console.log("ASDF", room, this.state.roomName)
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <div>
        </div>
        <button className="btn btn-default" onClick={this.join.bind(this, "Room1")}>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={this.state.rooms} room={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} room={this.state.roomName}/>
      </div>
    );
  }
});

var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    this.props.onSwitch(room)
  },
  render: function() {
    var self = this;
    var tabs = []
    tabs = self.props.rooms.map(function(room, i) {
      if (room === self.props.room) {
        return <li role="presentation" className="active" key={'Room_' + i}><a href="#">Join {room}</a></li>
      }
      return <li role="presentation" onClick={self.handleClick.bind(self, room)} key={'Room_' + i}><a href="#">Join {room}</a></li>
    })
    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
    )
  }
})

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: [],
      typingUsers: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
      console.log('message1', message);
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

    this.props.socket.on('stop typing', function(data) {
      console.log(data);
      this.setState({
        typingUsers: data
      })
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.room !== this.props.room) {
      this.props.socket.emit('room', nextProps.room)
      this.setState({
        messages: [],
        room: nextProps.room
      });
    }
  },
  messageType: function(event) {
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
    this.setState({
      message: event.target.value
    });
  },
  messageSubmit: function(event) {
    var currentUser = this.props.socket.username
    event.preventDefault();
    var message = {
      username: currentUser,
      content: this.state.message
    }
    this.props.socket.emit('message', this.state.message)
    var typingUsers = this.state.typingUsers
    if (typingUsers.indexOf(currentUser) !== -1) {
      var newTypingUsers = typingUsers.filter(function(user) {return user !== currentUser})
      this.props.socket.emit('stop typing', newTypingUsers)
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
    var messages = []
    messages = this.state.messages.map(function(a, i) {
      return <p key={'message_' + i}>{a.username}: {a.content}</p>
    })
    var typingUsers = []
    typingUsers = this.state.typingUsers.map(function(a, i) {
      return <p key={'typingUser_' + i}>{a} is typing...</p>
    })
    return (
      <div>
      {messages}
        <form onSubmit={this.messageSubmit}>
        {typingUsers}
          <input type="text" style={{display: "block"}} onChange={this.messageType} value={this.state.message}/>
          <input type="submit"/>
        </form>
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
