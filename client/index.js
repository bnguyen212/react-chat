var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: [],
      typingUsers: []
    }
  },
  componentDidMount: function() {
    console.log('my state')
    console.log(this.state)
    // WebSockets Receiving Event Handlers
    this.props.socket.on('message', function(message) {
      console.log('message', message);
      var newMessages = this.state.messages.concat(message);
      this.setState({
        messages: newMessages
      })
    }.bind(this));

    this.props.socket.on('typing', function(username){
      console.log('currently typing');
      if(this.state.typingUsers.indexOf(username) === -1) {
        this.setState({
          typingUsers: this.state.typingUsers.concat(username)
        })
        console.log('inside typing', this.state.typingUsers);
      }}.bind(this));

    this.props.socket.on('stopTyping', function(username) {
      var someIndex = this.state.typingUsers.indexOf(username);
      if(someIndex !== -1) {
        this.setState({
          typingUsers: [
            ...this.state.typingUsers.slice(0, someIndex),
            ...this.state.typingUsers.slice(someIndex + 1)
          ]
        });
      } console.log('stop typing users', this.state.typingUsers)
    }.bind(this))
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('componentWillReceiveProps', nextProps)
    if(nextProps.name === this.state.roomName) {
      alert('same room')
    } else {
      this.setState({
        name: nextProps.name,
        messages: []
      });
      console.log('MY NAME STATE', this.state);
    }
  },
  typing: function(event) {
    this.setState({
      message: event.target.value
    });

    if(event.target.value) {
      this.props.socket.emit('typing');
    } else {
      this.props.socket.emit('stopTyping');
    }

  },

  submit: function(event) {
    event.preventDefault();
    this.props.socket.emit('stopTyping');
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
    console.log('MY CURRENT STATE', this.state);
  },
  render: function() {
    return (
      <div>
      {this.state.messages.map((x) => <p>{x.username}: {x.content}</p>)}

      <p>
      {this.state.typingUsers.map((item) => (<span>{item}</span>))} is typing...
      </p>

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
      {this.props.rooms.map((x) => <button onClick={this.handleClick.bind(null, x)}>{x}</button>)}
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
      var username = prompt('Enter username');
      this.state.socket.emit('username', username);
      this.state.socket.username = username;
      // part 2
      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));
    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));
  },
  join: function(room) {
    // potentially problematic
    this.setState({
      roomName: room
    });
    this.state.socket.emit('room', room);
    console.log('HOLLA', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <h4>{this.state.roomName}</h4>

        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join} />

{// deleted join party room button here
  // <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
  //   Join the Party Place
  // </button>
}

        <ChatRoom socket={this.state.socket} name={this.state.roomName} />

      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
