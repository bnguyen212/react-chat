var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: null
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      this.state.socket.username = prompt("What is your desired username?");
      this.state.socket.emit('username', this.state.socket.username);
      this.setState({
        username: this.state.socket.username
      })
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
        alert(message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room
    })
    this.state.socket.emit('room', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        {this.state.roomName ? <ChatRoom socket={this.state.socket} name={this.state.roomName} username={this.state.username} /> : null}
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      userMessage: "",
      allMessages: [],
      roomName: this.props.name
    }   
  },
  receiveMessage: function(message) {
    console.log(message);
    this.setState({
      allMessages: this.state.allMessages.concat(message)
    })
  },
  componentDidMount: function() {
    this.props.socket.on('message', this.receiveMessage);
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.name === this.props.name){
      this.state.socket.emit('room', nextProps.name);
      this.setState({
        allMessages: [],
        roomName: nextProps.name
      })
    }
  },
  update: function (event){
    this.setState({
      userMessage: event.target.value
    })
  },
  submit: function(event){
    event.preventDefault();
    this.props.socket.emit('message', this.state.userMessage);
    this.setState({
      allMessages: this.state.allMessages.concat({username: this.props.username, content: this.state.userMessage}),
      userMessage: ''
    })
  },
  render: function() {
    var newArray = [];
    for (var i = 0; i < this.state.allMessages.length; i++){
      newArray.push(<p> {this.state.allMessages[i].username}: {this.state.allMessages[i].content} </p>)
    }
    return (
      <div>
        <h3>{this.state.roomName}</h3>
        <div> {newArray} </div>
        <form onSubmit={this.submit}>
        <input onChange={this.update} value={this.state.userMessage} placeholder="Enter message here"></input>
        <button className="btn btn-default" type="submit">
          Send
        </button>
        </form>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
