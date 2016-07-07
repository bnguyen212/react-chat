var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: ["Room1"],
      rooms: ["Room1", "Room2", "Room3", "Room4"]
    }
  },
  componentDidMount: function() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
        var username = prompt("please enter username");
        this.state.socket.emit("username", username);
        this.state.socket.username = username;
        this.setState({
          username: username
        });
      this.state.socket.emit('rooms', this.state.roomName)
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert("There is an error", message);
    }.bind(this));
  },
  join: function(room) {
    console.log(room);
    this.setState({
      roomName: room
    });
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
        <ChatRoom socket={this.state.socket} name={this.state.roomName} username={this.state.username}/>
      </div>
    );
  }
});

// var ChatRoomSelector = React.createClass({
//     console.log("this works!")
// });

var ChatRoom = React.createClass({
  getInitialState: function() {
      return {
        message: "",
        messages: []
      }
  },

  componentDidMount: function() {
    console.log('here', this.props.socket);
      this.props.socket.on('message', function(message) {
        console.log(message)
        this.setState({
          messages: this.state.messages.concat(message)
        })
      }.bind(this));
    },

    componentWillReceiveProps: function(nextProps){
      if(nextProps.name !== this.props.name){
        this.props.socket.emit('room', nextProps.name);
        this.setState({
          messages: []
        });
      }
    },
    change: function(event){
      this.setState ({
        message: event.target.value
      });
    },
    submit: function(event){
      event.preventDefault();
        console.log(this.state.message);
      this.props.socket.emit('message', this.state.message)
      this.setState({
        message: '',
        messages: this.state.messages.concat({
            username: this.props.username,
            content: this.state.message,
            rooms: this.state.rooms
          })
      });


    },
    render: function(){

        var displayMessages = [];
          for(var i = 0; i < this.state.messages.length; i++){
            displayMessages.push(<li>{this.state.messages[i].username}: {this.state.messages[i].content}</li>);
      }
      return(
        <div className="container">
      <div> {displayMessages} </div>
      <form onSubmit={this.submit}>
        <input type="text" onChange={this.change} value={this.state.message} />
        <button className="btn btn-default">Submit Text</button>
      </form>
      </div>
    )
  }

  });

ReactDOM.render(<App/>, document.getElementById('root'));
