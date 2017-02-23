var React = require('react');
var ReactDOM = require('react-dom');

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
      var newMessages = this.state.messages.concat(message);
      this.setState ({
        messages: newMessages
      })
    }.bind(this));
    this.props.socket.on('typing', function(username) {
      if(this.state.typingUsers.indexOf(username) === -1) {
        this.setState({
          typingUsers: this.state.typingUsers.concat(username)
        })
      }
    }.bind(this));
    this.props.socket.on('notTyping', function(username) {
      var index = this.state.typingUsers.indexOf(username)
      if(index !== -1) {
        this.setState({
          typingUsers: [
            ...this.state.typingUsers.slice(0,index),
            ...this.state.typingUsers.slice(index+1)
          ]
        })
      }
    }.bind(this))
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.name === this.props.name) {
      console.log("They're the same!");
    } else {
      this.setState({
        messages: [],
        name: nextProps.name
      })
    }
  },
  typing: function(event) {
    this.setState({
      message: event.target.value
    })
    if(event.target.value) {
      this.props.socket.emit('typing')
    } else {
      this.props.socket.emit('notTyping')
    }
  },
  submit: function(event) {
    event.preventDefault();
    this.props.socket.emit('notTyping');
    this.props.socket.emit('message', this.state.message);
    var newMessagesObject = { username: this.props.socket.username, content: this.state.message };
    var newMessages = this.state.messages.concat(newMessagesObject);
    this.setState({
      message: '',
      messages: newMessages
    })
  },
  render: function() {
    return (
      <div>
      {this.state.messages.map((item) =>
          <p>{item.username}: {item.content}</p>
      )}
      {!!this.state.typingUsers.length && <p>{this.state.typingUsers.map((user, i) => (<span>{this.state.typingUsers.length !== 1 && i === this.state.typingUsers.length-1 ? 'and' : ''} {user}{this.state.typingUsers.length <= 2 || i === this.state.typingUsers.length-1 ? '' : ','} </span>))}{this.state.typingUsers.length > 1 ? 'are' : 'is'} typing...</p>}
      <form onSubmit={this.submit}>
        <input type="text" placeholder="Type message here" onChange={this.typing} value={this.state.message} />
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
      </div>
    )
  }
})

var ChatRoomSelector = React.createClass({
  handleClick: function(x) {
    console.log('first room', x);
    this.props.onSwitch(x);
  },
  render: function() {
    return (
      <ul className="nav nav-pills">
          {this.props.rooms.map((x) => <li style={{cursor:'pointer'}} className={x === this.props.name ? "active" : ""} role="presentation"><a onClick={this.handleClick.bind(null, x)}>{x}</a></li>)}
      </ul>
    )
  }
})

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "Party Place",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("Please enter a username!");
      this.state.socket.emit('username', username);
      this.state.socket.username = username;
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    console.log('second room', room);
    this.setState({
      roomName: room
    });
    this.state.socket.emit('room', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <h3>Current Room: {this.state.roomName}</h3>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join} />
        <ChatRoom socket={this.state.socket} name={this.state.roomName} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
