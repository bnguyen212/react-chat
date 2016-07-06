var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Room 1",
      rooms: ["Room 1", "Room 2", "Room 3"]
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      this.state.socket.username = prompt('Please enter your username: ');
      this.state.socket.emit('username', this.state.socket.username);
      this.setState({
        username: this.state.socket.username
      })

      this.state.socket.emit('room', this.state.roomName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    });
    console.log("Joined: ", room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, this.state.rooms[0])}>
          Join Room 1
        </button>

        <button className="btn btn-default" onClick={this.join.bind(this, this.state.rooms[1])}>
          Join Room 2
        </button>

        <button className="btn btn-default" onClick={this.join.bind(this, this.state.rooms[2])}>
          Join Room 3
        </button>
        <ChatRoom username={this.state.username} socket={this.state.socket} name={this.state.roomName} />
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
       console.log("message: ", message);
       this.setState({
        messages: this.state.messages.concat(message)
       })
    }.bind(this))
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.props.name !== nextProps.name) {
      this.props.socket.emit('room', nextProps.name);
      this.setState({
        message: "",
        messages: []
      })
    }
  },
  msgUpdate: function(event) {
    this.setState({
      message: event.target.value
    });
  },
  msgSend: function(evt) {
    evt.preventDefault();
    this.props.socket.emit('message', this.state.message);
    this.setState({
      message: "",
      messages: this.state.messages.concat({username: this.props.username, content: this.state.message})
    })
  },
  render: function() {
    var msgs = [];
    for(var i=0; i<this.state.messages.length; i++) {
      var message = this.state.messages[i].content;
      msgs.push(<li>{this.state.messages[i].username}:{message}</li>);
    }
    
    return <div>
      <ul>
        {msgs}
      </ul>
      <form onSubmit={this.msgSend}>
        <input value={this.state.message} onChange={this.msgUpdate} type="text"></input>
        <button type="submit">Send</button>
      </form>
    </div>
  }
});

ReactDOM.render(<App/>, document.getElementById('root'));