var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      'socket': io(),
      'roomName': '',
      'username': '',
    }   
  },
  componentDidMount: function() {
    var s = this.state.socket
    // WebSockets Receiving Event Handlers
    s.on('connect', function() {
      console.log('connected');
      this.setState({'username':prompt("Enter your username")})
      s.emit('username', s.username)
    }.bind(this));

    s.on('message', function(message) {
      console.log('message received')
      console.log(message)
      this.setState({'messages': this.state.messages.concat([message])})
    }.bind(this))

    s.on('errorMessage', function(message) {
      alert(message)
      s.username = prompt("Enter your username")
      s.emit('username', s.username)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({'room':room})
    this.state.socket.emit('room', room)
  },
  render: function() {

    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        {this.state.roomName ? <ChatRoom /> : null}
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      'message': '',
      'messages': [],
    }
  },
  componentDidMount: function() {
    // socket events
    var s = this.props.socket

    s.on('message', function(message) {
      console.log('message received')
      console.log(message)
      this.setState({'messages': this.state.messages.concat([message])})
    }.bind(this))
  },
  componentWillReceiveProps: function() {

  },
  render: function() {
    return 
      <div>
        <textarea rows={5} placeholder="enter message here"/>
        {this.state.messages.map(function(elt) {
          return 
          <div className="message">
            <p>elt.username</p>
            <p>elt.content</p>
          </div>
        })}
      </div>
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
// ReactDOM.render(<ChatRoom socket={this.state.socket} name={this.state.roomName} />, document.getElementById('root'));
