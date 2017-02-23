var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: '',
      messages: []
    }
  },
  componentDidMount: function(e) {
    var self = this;
    console.log('Hello')
    //this.props.socket.emit('message', 'hello')
    this.props.socket.on('message', function(data) {
      console.log('DATA:', data);
      self.setState({
        messages: (self.state.messages.concat(data))
      })
    })
  },
  change: function(e) {
    //console.log(e.target.value);
    this.setState({
      message: e.target.value
    })
  },
  submit: function(e){
    e.preventDefault();
    console.log('val:', this.state.message);
    this.props.socket.emit('message', this.state.message);
    this.setState({
      messages: (this.state.messages.concat({
        username: this.props.socket.username,
        content: this.state.message
      })),
      message: ''
    })
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.props.name !== nextProps.name) {
      this.props.socket.emit('room', nextProps.name);
      this.setState({
        messages: [],
        name: nextProps.name
      })
    }
  },
  render: function() {
    var msg = [];
    console.log(this.state.messages);
    for (var i = 0; i < this.state.messages.length; i++) {
      msg.push(<li key={i}>{this.state.messages[i].username}: {this.state.messages[i].content}</li>);
    }
    return <div><h1>HI IM HERE</h1>
    <ul>{msg}</ul>
    <form onSubmit={this.submit}>
    <input onChange={this.change}
    placeholder="Text field"
    className="form-control"
    value={this.state.message} type="text" />
    <button className="btn btn-default">Send</button>
    </form>
    </div>;
  }
});
var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    this.props.onSwitch(room);
  },
  render: function() {
    var self = this;
    var r = this.props.rooms.map(function(item, i) {
      return <button className="btn btn-default"
      key={i} onClick={self.handleClick.bind(self, item)}>{item}</button>;
    })
    return <div>{r}</div>
  }
});
var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'Room 1',
      rooms: ['Room 1', 'Room 2', 'Room 3']
    }
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      this.state.socket.username = prompt('can i hab ur name pls');
      this.setState({
        username: this.state.socket.username
      });
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));
    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert(message);
    }.bind(this));
  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    })
    this.state.socket.emit('room', this.state.roomName);
    console.log(room);
  },
  render: function() {
    return (
      <div>
      <h1>React Chat</h1>
      <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
      Join the Party Place
      </button>
      <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName}
      onSwitch={this.join} socket={this.state.socket} />
      <ChatRoom name={this.state.roomName} socket={this.state.socket} />
      </div>
    );
  }
});
ReactDOM.render(<App />, document.getElementById('root'));
