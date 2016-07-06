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
   this.state.socket.emit('room', this.state.roomName)
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
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
    this.props.socket.on('messages', function(messages) {
      this.setState({
        messages: messages
      })
    } )
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
  render: function() {
    // this.props.socket,
    // this.props.roomName
    
    return this.state.message.map(function(message) {
      
    });
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
