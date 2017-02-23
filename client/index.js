var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Room1",
      rooms: ["Room1", "Room2", "Room3", "Room4"]
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.state.socket.username = prompt("Insert username!")
      this.setState({
        username: this.state.socket.username
      });
      this.state.socket.emit('username', this.state.username)
      this.state.socket.emit('room', this.state.roomName);
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
    });
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <div>
        </div>
        <button className="btn btn-default" onClick={this.join.bind(this, "Room1")}>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={this.state.rooms} room={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} room={this.state.roomName}/>
      </div>
    );
  }
});

var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    this.props.onSwitch(room)
  },
  render: function() {
    var self = this;
    var tabs = []
    tabs = self.props.rooms.map(function(room, i) {
      if (room === self.props.room) {
        return <li role="presentation" className="active" key={'Room_' + i}><a href="#">Join {room}</a></li>
      }
      return <li role="presentation" onClick={self.handleClick.bind(self, room)} key={'Room_' + i}><a href="#">Join {room}</a></li>
    })
    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
    )
  }
})

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
      console.log('message1', message)
      this.setState({
        messages: this.state.messages.concat(message)
      })
    }.bind(this))
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.room !== this.props.room) {
      this.props.socket.emit('room', nextProps.room)
      this.setState({
        messages: [],
        room: nextProps.room
      });
    }
  },
  messageType: function(event) {
    this.setState({
      message: event.target.value
    });
  },
  messageSubmit: function(event) {
    event.preventDefault();
    var message = {
      username: this.props.socket.username,
      content: this.state.message
    }
    this.props.socket.emit('message', this.state.message)
    console.log('message2', message)
    this.setState({
      message: "",
      messages: this.state.messages.concat(message)
    })
  },
  render: function() {
    var messages = []
    messages = this.state.messages.map(function(a, i) {
      return <p key={'message_' + i}>{a.username}: {a.content}</p>
    })
    return (
      <div>
      {messages}
        <form onSubmit={this.messageSubmit}>
          <textarea rows="2" style={{display: "block"}} onChange={this.messageType} value={this.state.message}/>
          <input type="submit"/>
        </form>
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
