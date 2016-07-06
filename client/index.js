var React = require('react');
var ReactDOM = require('react-dom');
// var jQuery = require('jQuery');
// var Bootstrap = require('bootstrap');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Party Place",
      username: "",
      rooms: ["Party Place", "SandyChat", "Other Room"]
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt("Enter a username");
      this.setState({
        username: username
      })
      this.state.socket.emit('username', username)
      this.state.socket.emit('room', this.state.roomName)
    }.bind(this));


    this.state.socket.on('errorMessage', function(message) {
      alert(message)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState ({
      roomName: room
    })
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join}/>
        <ChatRoom username={this.state.username} name={this.state.roomName} socket={this.state.socket}/>
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
    var that = this

    this.props.socket.on('message', function(message) {
      that.setState({
        messages: that.state.messages.concat(message.username+": "+message.content)
      })
    })
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.name !== this.props.name) {
      this.props.socket.emit('room', nextProps.name)
      this.setState({
        messages: []
      })
    }
  },
  change: function(e) {
    this.setState({
      message: e.target.value
    })
  },
  submit: function(event) {
    event.preventDefault();
    
    this.setState({
      messages: this.state.messages.concat(this.props.username+": "+this.state.message),
      message: ""
    });
    this.props.socket.emit('message', this.state.message)
  },
  render: function() {
    var toReturn = [];
    var currentMessages = this.state.messages
    currentMessages.forEach(function(item) {
      toReturn.push(<li>{item}</li>)
    })
    return (
      <div>
        <ul>{toReturn}</ul>
        <form onSubmit={this.submit}>
          <input type="text" onChange={this.change} value={this.state.message}/>
          <button className="btn btn-default" type="submit">Send Message</button>
        </form>
      </div>
    )
  }
});

var ChatRoomSelector = React.createClass({
  handleClick: function(room) {
    console.log("lookie: ",room)
    this.props.onSwitch(room)
  },
  render: function() {
    var tabs = [];
    var myRooms = this.props.rooms
    var current = this.props.name
    //console.log("see: ",this)
    var that = this
    myRooms.forEach(function(item) {
      if (item === current) {
        tabs.push(<li role="presentation" onClick={that.handleClick.bind(that, item)} className="active"><a href="#">{item}</a></li>)
      } else {
        tabs.push(<li role="presentation" onClick={that.handleClick.bind(that, item)}><a href="#">{item}</a></li>)
      }
    })
    return (
      <div>
        <ul className="nav nav-tabs">{tabs}</ul>
      </div>
    )
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
