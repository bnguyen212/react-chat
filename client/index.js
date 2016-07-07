var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: 'none selected',
    }   
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.setState({
        username: prompt('enter a username')
      })
      this.state.socket.emit('username', this.state.username);
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
   //this.state.socket.emit('room', this.state.roomName)
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          join party place chat
        </button>
        <ChatRoom username={this.state.username} socket={this.state.socket} roomName={this.state.roomName}/>
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
    this.props.socket.on('message', function(messages) {
      this.setState({
        messages: this.state.messages.concat(messages)
      })
    }.bind(this))
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.roomName !== this.props.roomName) {
      this.props.socket.emit('room', nextProps.roomName);
      this.setState({
        roomName: nextProps.roomName,
        messages: []
      })
    }
  },
  change: function(event) {
    this.setState({
      message: event.target.value
    });
  },
  submit: function(event) {
    event.preventDefault();
    this.props.socket.emit('message', this.state.message);
    this.setState({
      messages: this.state.messages.concat({
         username: this.props.username,
         content: this.state.message
      }),
      message: ''
    })
  },
  render: function() {
    // this.props.socket,
    // this.props.roomName
    var mappedMessages = this.state.messages.map(function(message) {
      return <p>{message.username {color: blue}}: {message.content}</p>
    });
    return (
      <div>
      <div>{mappedMessages}</div>
      <input placeholder="write a message" className="form-control" type="text" value={this.state.message} onChange={this.change}/>
      <button className="btn btn-default" onClick={this.submit}>send message</button> 
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
