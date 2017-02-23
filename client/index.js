var React = require('react');
var ReactDOM = require('react-dom');
var ChatRoomSelector = React.createClass({
  handleClick: function(roomName) {
    this.props.onSwitch(roomName)
  },
  render: function() {
    return (
      <ul>{this.props.room.map((item) => <li onClick={this.handleClick.bind(this,item)}>{item}</li>)}
        </ul>
    );
  }
})

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: '',
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
      var arr = this.state.messages.slice();
      arr.push(message);
      this.setState({
        messages: arr
      })
    }.bind(this))
    console.log(this.props.socket.username + "username?");
    this.props.socket.emit('messages', this.state.messages);
    this.props.socket.emit('username', this.props.socket.username);
    this.props.socket.emit('room', this.props.name);
  },
  componentWillReceiveProps: function(nextProp) {
    if (nextProp.name !== this.props.name) {
      this.props.socket.emit('room', 'nextProp.name');
      this.setState({
        messages: []
      })
    }
  },
  shoot: function(e) {
    e.preventDefault();
    console.log('shooooooot');
    this.props.socket.emit('message', this.state.message);
    var message = {
      username: this.props.socket.username,
      content: this.state.message
    }
    var arr = this.state.messages.slice();
    arr.push(message);
    this.setState({
      messages: arr,
      message: ''
    })
    console.log(this.state.messages + "messages");
  },
  messageChange: function(e) {
    e.preventDefault();
    this.setState({
      message: e.target.value
    })
  },
  render: function() {
    return (
      <div>
        <h1>Chat</h1>
        <ul>
          {this.state.messages.map((item) => <li>{item.content} by:{item.username} </li>)}
        </ul>
        <form onSubmit={this.shoot}>
          <input value={this.state.message} onChange={this.messageChange}/>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
})

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: 'Party Place',
      rooms: ['Party Place', 'Room1', 'Room2']
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      this.state.socket.username = prompt('Whats yo name');
      this.state.socket.emit('username', this.state.socket.username);
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    console.log(room + "what room is joined");
    this.setState({
      roomName: room
    })
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector room={this.state.rooms} name={this.state.roomName} onSwitch={this.join.bind(this,)}/>
        <ChatRoom socket={this.state.socket} name={this.state.roomName}/>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
// <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
//   Join the Party Place
// </button>
