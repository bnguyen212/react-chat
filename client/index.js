var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {

    return {
      message: 'Newvuew',
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message){
      alert('hello');
      this.setState();
    });
  },
  render: function(){
    return(
      <div>
      {this.state.message}
      </div>
    )
  }
});


var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: 'partyplace!'
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt('What is your username?');

      //TODO: this.setState
      this.state.socket.username = username;
      console.log(this.state.socket);
      this.state.socket.emit('username', username);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function() {
    console.log('join')
    this.setState({
      roomName: this.state.roomName
    })
    this.state.socket.emit('room', "something");
      
  },
  render: function() {
    return (
      <div>
        <ChatRoom socket={this.state.socket} name={this.state.roomName}/>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join} >
          Join the Party Place
        </button>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
