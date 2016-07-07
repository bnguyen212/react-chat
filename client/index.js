var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoomSelector = React.createClass({
  handleClick: function(roomName) {
    this.props.onSwitch(roomName)
  },
  render: function() {
    return (
      <div>
        <ul className="nav nav-tabs">
        {this.props.rooms.map(function(room) {
          if(room === this.props.roomName)
            return <li role="presentation" className="active"><a href="#">{room}</a></li>
          else return <li role="presentation" onClick={this.handleClick.bind(this, room)}><a href="#">{room}</a></li>
        }, this)}
        </ul>
      </div>
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
      this.setState({
        messages: this.state.messages.concat({
          username: message.username, //Being SENT a message (has a username)
          content: message.content
        })  //Returns the new array
      })
    }.bind(this))
  },
  componenetWillRecieveProps: function(nextProps) {
    if(this.props.roomName !== nextProps.roomName) {
      this.props.socket.emit('room', nextProps.roomName)
    }
    this.setState({
      messages: [],
      roomName: nextProps.roomName
    })

  },
  update: function(event) {
      this.setState({
          message: event.target.value
      })
    },
  submit: function(event) {
    event.preventDefault();
    console.log('default prevented')
    this.props.socket.emit('message', { username: this.props.username, content: this.state.message})
    this.setState({
      messages: this.state.messages.concat({ username: this.props.username, content: this.state.message}),
      message: ""
    })
  },
  render: function() {
    console.log(this.state.messages)
    return (
      <div className="container">
      <div className="row">
      <ul>{this.state.messages.map(function(message){
        return <li>{message.username} says {message.content}</li>
      })}
      </ul>
      <form onSubmit={this.submit}>
        <input type="text" onChange={this.update} value={this.state.message} placeholder="Message"/>
        <input type="submit"/>
      </form>
      </div>
      </div>
    )
  }
})

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


var App = React.createClass({
  //Initial state of the system
  getInitialState: function() {
    return {
      //Socket username
      socket: io(),
      roomName: "Party Place",
      rooms: ["Party Place", "Tyler's House", "Sean's Realm of Fun", "Ethan . . . No!"],
      username: ""
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      //console.log('connected');
      var username = prompt("Please enter a username")
      //console.log('Username:', username)
      this.setState({username: username})
      //this.state.username = username
      this.state.socket.emit('username', this.state.username)
      this.state.socket.emit('room', this.state.roomName)
      //console.log('this.state.socket.username:', this.state.socket.username)

    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      var error = prompt(message)
      console.log("Error:", message)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    })
    //Room is arbitrary

    console.log(room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place <br/>
        </button>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
