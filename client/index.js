var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: 'Room 1',
      rooms: [
        'Room 1', 'Room 2', 'Room 3'
      ],
      username: ''
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      var username = prompt('Please enter a username');
      this.state.socket.emit('username', username);
      this.setState({username: username});
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
      if (message == 'No username!' || message == 'Username not set!') {
        var username = prompt('Username not valid, try again');
        this.state.socket.emit('username', username);
        this.setState({username: username});
      }
    }.bind(this));

  },
  join: function(room) {
    this.setState({roomName: room});
    ReactDOM.render(
      <ChatRoom socket={this.state.socket} roomName={this.state.roomName}/>, document.getElementById('selector'));
  },
  render: function() {
    return (
      <div id="header">
        <h1>React Chat</h1>
        <h2>Welcome, {this.state.username}</h2>
        <ChatRoomSelector id="selector" rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
      </div>
    );
  }
});

var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    this.props.onSwitch(room);
  },
  render: function() {
    var self = this;
    return (
      <div>
        <ul className='nav nav-tabs'>
          {this.props.rooms.map(function(roomName) {
            if (self.props.roomName == roomName) {
              return <li className='active' onClick={self.handleClick.bind(self, roomName)}>
                <a href='#'>{roomName}</a>
              </li>
            }
            return <li onClick={self.handleClick.bind(self, roomName)}>
              <a href='#'>{roomName}</a>
            </li>
          })}
        </ul>
      </div>
    )
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {message: '', messages: [], roomName: this.props.roomName}
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
      this.setState({
        messages: this.state.messages.concat({username: message.username, content: message.content})
      });
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.roomName != this.props.roomName) {
      this.props.socket.emit('room', nextProps.roomName);
      this.setState({messages: [], roomName: nextProps.roomName});
    }
  },
  typing: function(event) {
    this.setState({message: event.target.value})
  },
  send: function(event) {
    event.preventDefault();
    if (this.state.message) {
      this.props.socket.emit('message', this.state.message);
      this.setState({
        messages: this.state.messages.concat({username: this.props.username, content: this.state.message}),
        message: ''
      });
    }
  },
  render: function() {
    return (
      <div>
        <h1>{this.props.roomName}</h1>
        <ul>
          {this.state.messages.map(function(message) {
            return <li>{message.username}: {message.content}</li>
          })}
        </ul>
        <form onSubmit={this.send}>
          <div className="input-group">
            <input className="form-control" type="text" onChange={this.typing} value={this.state.message}></input>
            <span className="input-group-btn">
              <button className="btn btn-default" type="submit">Send</button>
            </span>
          </div>
        </form>
      </div>
    )
  }
})

ReactDOM.render(
  <App/>, document.getElementById('root'));
