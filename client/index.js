var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function() {

    return {
      message: '',
      messages: [],
      text: ''
    }
  },
  componentDidMount: function() {
    console.log('911 was an inside job!')
    this.props.socket.on('message', function(message){
      console.log('message1', message);
      this.setState({messages: this.state.messages.concat(message.username + ': ' + message.content)});
      return message;
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps){
    if(this.props.name !== nextProps.name){
      this.props.socket.emit('room', nextProps.name);
      this.setState({
        messages: []
      });
    }
  },

  click: function(){
    var msg = {
      content: this.state.text,
      username: this.props.socket.username
    };
    console.log(msg.content)
    console.log(msg, 'msg')
    this.props.socket.emit('message', this.state.text)
    this.setState({messages: this.state.messages.concat(msg.username+': ' + msg.content)});
    this.setState({text: ""});
  },
  change: function(evt) {
    this.setState({text: evt.target.value});
  },
  render: function(){
    console.log(this.state.messages);
    return(
      <div>
      hellloooooooooo peopleeelelelelelele
      <ul>{this.state.messages.map(function(x,i){
        return (<li key={i}>{x}</li>)
      })}</ul>
      <input placeholder = "What's Up!" value = {this.state.text} onChange = {this.change}/>
      <button onClick = {this.click}>Submit</button>
      </div>
    )
  }
});

var ChatRoomSelector = React.createClass({
  handleClick: function(room){
    this.props.onSwitch(room)
    this.props.onJoin()
  },
  render: function(){
    var self = this;
    return(
      <div>{this.props.rooms.map(function(room, i){
        return (<button key = {i} className="btn btn-default" onClick={self.handleClick.bind(null, room)}>{room}</button>)
      })}</div>
    )
  }
})


var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: 'partyplace!',
      rooms: ['partyplace!', 'MyHouse', 'HerHouse']
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      var username = prompt('What is your username?');

      //TODO: this.setState
      this.state.socket.username = username;
      console.log(this.state.socket);
      this.state.socket.emit('username', username);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));



  },
  switched: function(room){
    this.setState({
      roomName: room
    })
  },
  join: function() {
    console.log(this.state.roomName)

    this.state.socket.emit('room', this.state.roomName);


  },
  render: function() {
    return (
      <div>
      <h1>React Chat</h1>
      <button onClick={this.join}>Join</button>
      <h2>{this.state.roomName}</h2>
      <ChatRoomSelector socket={this.state.socket} name={this.state.roomName} rooms={this.state.rooms} onSwitch={this.switched} onJoin={this.join}/>
      <ChatRoom socket={this.state.socket} name={this.state.roomName} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
