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
    console.log('my state')
    console.log(this.state)
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
    console.log('componentWillReceiveProps', nextProps)
    if(nextProps.name === this.state.roomName) {
      alert('same room')
    } else {
      this.props.socket.emit('room', nextProps.name);
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
        <input type="text" onChange={this.typing} value={this.state.message} placeholder="Enter a message" />
        <input type="submit" className = "btn btn-primary"  />
      </form>
      </div>
    );
  }
});


var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    console.log('ROOOMROMOMRO: ', room);
    this.props.onSwitch(room);
    console.log('props', this.props);
  },
  render: function() {
    return (
      <div>
      {this.props.rooms.map((x) => <button onClick={this.handleClick.bind(this, x)}>{x}</button>)}
      </div>
    );
  }
});



var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Party Place",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    }
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt('Enter username');
      this.state.socket.emit('username', username);
      this.state.socket.username = username;
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // this.setState({
    //   roomName: room
    // });
    this.state.socket.emit('room', room);
    console.log('HOLLA', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>

        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join} />

        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        <ChatRoom socket={this.state.socket} name={this.state.roomName} />

      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
