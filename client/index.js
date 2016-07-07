var React = require('react');
var ReactDOM = require('react-dom');

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
      this.setState({
        username: prompt('Please enter a username')
      })
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName);
      // this.join(this.state.roomName)
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
    });
    // this.state.socket.emit('room', room);
    console.log(room)
  },

  // <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
  //   Join the Party Place
  // </button>

  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} name={this.state.roomName} username={this.state.username}/>
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
    this.props.socket.on('message', function(message) {
      alert(message.username + ': ' + message.content);
      var list = this.state.messages.concat(message);
      this.setState({
        messages: list
      })
    }.bind(this))
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.props.name !== nextProps.name) {
      this.props.socket.emit('room', nextProps.name);
      this.setState ({
        messages: [],
        name: nextProps.name
      })
    }
  },
  typing: function(e) {
    this.setState({
      message: e.target.value
    })
    console.log(e.target.value)
  },
  submit: function(e) {
    e.preventDefault();
    this.props.socket.emit('message', this.state.message);
    var obj = {
      username: this.props.username,
      content: this.state.message
    }
    var list = this.state.messages.concat(obj);
    this.setState({
      messages: list,
      message: ''
    })
  },
  render: function() {
    // this.props.socket
    var messagesList = [];
    for (var i = 0; i < this.state.messages.length; i ++) {
      messagesList.push(<li>{this.state.messages[i].username}: {this.state.messages[i].content}</li>);
    }
    return <div>
      <ul>
        {messagesList}
      </ul>
      <form onSubmit={this.submit}>
        <input onChange={this.typing} type="text" placeholder="Send message..." value={this.state.message}/>
        <input type="submit" value="Send"/>
      </form>
    </div>

  }
})

var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    this.props.onSwitch(room);
  },
  render: function() {
    var roomsList = [];
    for (var i = 0; i < this.props.rooms.length; i ++) {
      if (this.props.name === this.props.rooms[i]) {
        roomsList.push(<li role="presentation" className="active" onClick={this.handleClick.bind(this, this.props.rooms[i])}><a>{this.props.rooms[i]}</a></li>);
      } else {
        roomsList.push(<li role="presentation" onClick={this.handleClick.bind(this, this.props.rooms[i])}><a>{this.props.rooms[i]}</a></li>);
      }
    }
    return <ul className="nav nav-tabs">
      {roomsList}
    </ul>
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
