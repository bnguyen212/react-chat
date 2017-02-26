var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoomSelector = React.createClass({
  render: function() {
    return (
      <div className="button-list">
        {
          this.props.rooms.map((room) => {
            return <button key={room} className="btn btn-default" onClick={this.props.onSwitch.bind(null, room)}>
              Join the {room}
            </button>
          })
        }
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: '',
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('room', function(messages) {
      console.log("received messages: ", messages);
      this.setState({
        messages: messages
      });
    }.bind(this));

    this.props.socket.on('message', function(message) {
      this.setState({
        messages: [...this.state.messages, message]
      });
    });
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.name !== this.props.name) {
      this.props.socket.emit('room', newProps.name);
      this.setState({
        messages: []
      });
    }
  },
  change: function(event) {
    console.log("onChange", event.target.value);
    this.setState({
      message: event.target.value
    });
  },
  submitClick: function(event) {
    event.preventDefault();

    if (!this.props.name) {
      alert("Please join a room first");
      return false;
    }

    var message = {
      username: this.props.socket.username,
      content: this.state.message
    };

    this.props.socket.emit('message', message);

    this.setState({
      messages: [...this.state.messages, message],
      message: ''
    });
  },
  render: function() {
    return (
      <div>
        <input type="text" onChange={this.change} value={this.state.message} />
        <button type="submit" onClick={this.submitClick}>Submit</button>
        <ul>
        {
          this.state.messages.map((message) => {
            return (
              <li key={(Math.floor(Math.random() * 1e6) + 1 ) + message.content}>
                {message.username}: {message.content}
              </li>
            );
          })
        }
        </ul>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"],
      roomName: 'Party Place'
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt("Your username?");

      var socket = this.state.socket;
      socket.username = username;
      this.setState({
        socket: socket
      });

      this.state.socket.emit('username', username);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    });

    this.state.socket.emit('room', room);
    console.log("changed room to: ", this.state, room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join} />
        <ChatRoom name={this.state.roomName} socket={this.state.socket} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
