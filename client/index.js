var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Party Place",
      rooms: ["Party Place", "Josh''s Fun Time", "Sandwich Connoissuers", "CdT"]
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.setState({
        username: prompt("What is your username?")
      })
      this.state.socket.emit("username", this.state.username)
      this.join(this.state.roomName)
      this.state.socket.emit('room', this.state.roomName);
      // YOUR CODE HERE (2)
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert(message)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    })
    console.log(room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join} onClick={this.handleClick} />
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
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
    this.props.socket.on('message', function(data){
      console.log(data);
      console.log(data.content);
      this.setState({
        messages: this.state.messages.concat(data)
      })

    }.bind(this) )
  },
  componentWillReceiveProps: function(nextProps) {
    if(this.props.roomName !== nextProps.roomName) {
      this.props.socket.emit('room', nextProps.roomName);
      this.setState({
        messages: []
      })
    }
  },
  hallo: function(event) {
    this.setState({
      message: event.target.value
    })

  },
  gotit: function(event) {
    event.preventDefault();
    console.log(this.props.username)
    console.log(this.state.message)
    this.props.socket.emit('message', {username: this.props.username, content: this.state.message});

    this.setState({
      messages: this.state.messages.concat({username: this.props.username, content: this.state.message}),
      message: ""
    });
    //document.getElementById("helpme").reset();
  },
  render: function() {
    return <div> 
    <ul> 
      {this.state.messages.map(function(message) {
        return (<li> {message.username} : {message.content} </li>)
      })}
       </ul>
      <form id="helpme" onSubmit={this.gotit}>
        <input type="text" onChange={this.hallo} placeholder="Writer your message..." value={this.state.message} />
        <input type="submit"/>
      </form>
      </div>
    }
});

var ChatRoomSelector = React.createClass({
  render: function() {
    return <ul className="nav nav-tabs"> {this.props.rooms.map(function(name) {
      if(this.props.name === name) {
        return <li role = "presentation" className = "active" onClick={this.handleClick.bind(this, name)}><a href="#"> {name} </a></li>
      } else {
        return <li role = "presentation" onClick={this.handleClick.bind(this, name)}><a href="#"> {name} </a></li>
      }
    }.bind(this))}
    </ul>


  },
  handleClick: function(room) {
    this.props.onSwitch(room);
  }


})

ReactDOM.render(<App />, document.getElementById('root'));