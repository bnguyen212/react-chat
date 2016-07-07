var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "party room",
      rooms:["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"],
      username: ''
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      var user = prompt('enter a username');

      this.setState({
        username: user
      });

      this.state.socket.emit('username', user);
      this.state.socket.emit('room', this.state.roomName);

    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert(message);
    }.bind(this));

  },
  join: function(index) {
    // room is called with "Party Place"
    alert(this.state.rooms[index]);
    this.state.roomName = this.state.rooms[index];
    this.state.socket.emit('room',this.state.roomName);
  },
  render: function() {
    return (
       <div style={{background:'#F24545'}}>
        <h1 style={{color:'#fde88b', marginLeft:'50px'}}>React Chat</h1>
          <h2>{this.state.username}'s Messages</h2>
       <ChatRoom socket ={this.state.socket} username={this.state.username}/>
        <ChatRoomSelector socket={this.state.socket} 
        username={this.state.username}
        rooms={this.state.rooms}
        name={this.state.roomName}
        onSwitch={this.join}/>
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function(){
    return{
    message: '',
    messages: []
    };
  },
  componentDidMount: function(){
    this.props.socket.on('message', function(message){
      var newMessages = this.state.messages;
      newMessages.push(message.content);
      this.setState({
        messages: newMessages
      });

    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.name !== this.props.name){
      this.props.socket.emit('room', nextProps.name);
      this.setState({
        messages:[]
      });
    }
  }, 
  inputChange: function(evt){
    var msg = evt.target.value;
    this.setState({
      message:msg
    });
  },
  submitMessage: function(evt){
    evt.preventDefault();
    this.props.socket.emit('message', this.state.message);
    var newMessages = this.state.messages;
    newMessages.push(this.state.message);
    this.setState({
      messages: newMessages,
      message: ''
    });
  },
  render: function(){
    var messagesList = [];

    for(var i = 0; i < this.state.messages.length; i++){
      var msg = <li>{this.state.messages[i]}</li>
      messagesList.push(msg);
    }

    var messagePanel = <ul>{messagesList}</ul>

    var output = <div className="form-group">
    {messagePanel}
    <form onSubmit={this.submitMessage}>
    Message:<br/>
      <input onChange={this.inputChange} className ="form-control" type="text" name="message" value={this.state.message}/>
      <button className="btn btn-info" type="submit" value="Submit">Send Message</button>
      </form>
    </div>;
    return output;
  }
});

var ChatRoomSelector = React.createClass({
  getInitialState: function(){
    return{
    };
  },
  handleClick: function(index){
    return(function(){
      console.log(index);
      this.props.onSwitch(index);
    }.bind(this));
  },
  render:function(){
    var rooms = [];

    for(var i = 0; i < this.props.rooms.length; i++){
      var room = <li className="form-control" onClick={this.handleClick(i)}>{this.props.rooms[i]}</li>
      rooms.push(room);
    }
    var roomPanel = <ul>{rooms}</ul>

    var output = <div className="form-group">
    {roomPanel}
    </div>;
    return output;
  }

});

ReactDOM.render(<App />, document.getElementById('root'));
