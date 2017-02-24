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
    var username = prompt("Username:");
    var self = this;

    this.state.socket.on('connect', function() {
      console.log('connected');
      this.state.socket.username = username;
      self.state.socket.emit('username', username);
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
    console.log("emitted", room);


  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={ this.join.bind(this, "Room 1") }>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={ this.state.rooms } name={ this.state.name } onSwitch={ this.join}></ChatRoomSelector>
        <ChatRoom socket={ this.state.socket } username={ this.state.username } roomName={ this.state.roomName }></ChatRoom>
      </div>
      );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      socket: this.props.socket,
      roomName: this.props.roomName,
      message: "",
      messages: []
    }
  },
  componentDidMount: function() {
    this.props.socket.on('message', function(message) {
      this.setState({
        messages: [...this.state.messages, message]
      });
    }.bind(this));

  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.name !== this.props.name) {
      //emit room event at this.props.socket
      this.props.socket.emit('room', nextProps.room);
      this.setState({
        messages: [],
        name: this.props.name
      });
    }
  },
  change: function(evt) {
    this.setState({
      textBoxValue: evt.target.value
    });
  },
  submit: function(e) {
    e.preventDefault();

    var msg = {
      username: this.props.socket.username,
      content: this.state.textBoxValue
    };

    this.props.socket.emit('message', msg.content); //emit msg

    this.setState({
      messages: [...this.state.messages, msg], //add msg to array
      textBoxValue: "" //clear msg
    });
  },
  render: function() {
    return (
      <div>
        <form onSubmit={ this.submit }>
          <div>
            { this.state.messages.map(function(message, i) {
                return (<p key={ i }>
                          { message.username }:
                          { message.content }
                        </p>)
              }) }
          </div>
          <input type="text" onChange={ this.change } value={ this.state.textBoxValue }></input>
          <button type="submit">Send</button>
        </form>
      </div>);
  }
});

var ChatRoomSelector = React.createClass({
  getInitialState: function() {
    return {
      rooms: this.props.rooms,
      name: this.props.roomName,
      onSwitch: ""
    }
  },
  handleClick: function(name) {
    this.props.onSwitch(name);
  },
  render: function() {
    return (
      <ul className="nav nav-tabs">
        { this.props.rooms.map(function(room) {
            return (<li role="presentation">{room}</li>)
          }) }
      </ul>
    )
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
