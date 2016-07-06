var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      socket: this.props.socket,
      message: "",
      messages: [],
      room: this.props.room
    }
  },
  receiveMessage: function(msg) {
      this.setState ({
        messages: this.state.messages.concat([msg])
      });
  },
  updateMessage: function(e) {
    this.setState ({
      message: e.target.value
    })
  },
  componentDidMount: function() {
    this.state.socket.on('message', this.receiveMessage);
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.room != this.props.room) {
      this.state.socket.emit('room', nextProps.room);
      this.setState({
        messages: [],
        room: nextProps.room
      })
    }
  },
  sendMessage: function(e) {
    e.preventDefault();
    this.state.socket.emit('message', this.state.message);
    this.setState({
      message: '',
      messages: this.state.messages.concat([{username: this.props.username, content: this.state.message}])
    })
  },
  render: function() {
    var temp = [];

    for (var i = 0; i < this.state.messages.length; i++) {
      temp.push(<li>{this.state.messages[i].username}: {this.state.messages[i].content}</li>);
    }
    return (
      <div>
        <h1>Messages</h1>
        <div><ul>{temp}</ul></div>
        <form onSubmit={this.sendMessage}>
        <input className="form-control" type="text" onChange={this.updateMessage} value={this.state.message}/>
        <button type="submit" className="btn btn-default" >Send Message</button>
        </form>
      </div>
    )
      
  }
})

var ChatRoomSelector = React.createClass({
  getInitialState: function() {

  },
  handleClick: function() {

  },
  render: function() {
    return
  }
})

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "Party Place",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "Quidkids"]
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("Enter a username");
     this.setState ({
      username: username
     })
       this.state.socket.emit('username', username);
       this.state.socket.emit('room', roomName);
    }.bind(this));

   
    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert('errorMessage ' + message);
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
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={this.state.rooms} room={this.stateRoomName} onSwitch={this.join} />
        <ChatRoom username={this.state.username} socket={this.state.socket} room={this.state.roomName}></ChatRoom>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
