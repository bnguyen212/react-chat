var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: []
    }
  },
  componentDidMount: function() {
    // var self = this;
    // WebSockets Receiving Event Handlers
    this.props.socket.on('message', function(message) {
      console.log('socket is indeed on');
      console.log('message', message);
      var newMessages = this.state.messages.concat(message);
      this.setState({
        // name: this.props.name,
        messages: newMessages
      })
    }.bind(this));
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('componentWillReceiveProps')
    if(nextProps.name === this.props.name) {
      alert('same room')
    } else {
      this.props.socket.emit('room', nextProps.room);
      this.setState({
        name: nextProps.name,
        messages: []
      });
    }
  },
  typing: function(event) {
    console.log('event in typing', event);
    this.setState({
      message: event.target.value
    })
  },
  submit: function(event) {
    event.preventDefault();
    this.props.socket.emit('message', this.state.message)
    var newMessageObj = {
      username: this.props.socket.username,
      content: this.state.message
    }
    var newMessages = this.state.messages.concat(newMessageObj)
    this.setState({
      message: '',
      messages: newMessages
    })
  },
  render: function() {
    return (
      <div>
      {this.state.messages.map((x) => <p>{x.username}: {x.content}</p>)}
      <form onSubmit={this.submit}>
        <input type="text" onChange={this.typing} value={this.state.message} placeholder="Enter message if you will" />
        <input type="submit" value="submit" className = "btn btn-primary"  />
      </form>
      </div>
    );
  }
});


var ChatRoomSelector = React.createClass({
  getInitialState: function() {
    return {
      yo: 'hi'
    }
  },
  componentDidMount: function() {
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('componentWillReceiveProps')
    if(nextProps.name === this.props.name) {
      alert('same room')
    } else {
      this.props.socket.emit('room', nextProps.room);
      this.setState({
        name: nextProps.name,
        messages: []
      });
    }
  },
  typing: function(event) {
  },
  submit: function(event) {

  },
  render: function() {
    return (
      <div>

      </div>
    );
  }
});



var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "No room selected!"
    }
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt('Enter username');
      this.state.socket.emit('username', username);
      this.state.socket.username = username;
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // this.setState({
    //   roomName: room
    // })
    console.log(room);
    this.state.socket.emit('room', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        <ChatRoom socket={this.state.socket} name={this.state.socket.name} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
