var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function(){
    return {
      message: '',
      messages: []
    }
  },
  componentDidMount: function(){
    this.props.socket.on('message', function(message){
      var arr = this.state.messages.slice();
      this.setState({messages: arr.push(message)})
    })

    this.props.socket.emit('message', this.state.message);
    this.props.socket.emit('username', this.props.socket.username);
    this.props.socket.emit('room', this.props.name)
  },
  componentWillReceiveProps: function(nextProps){
    if(this.props.name !== nextProps.name){
      this.props.socket.emit('room', nextProps.name);
      this.setState({
        messages: []
      });
    }
  },
  updateString: function(e){
    e.preventDefault();
    this.setState({
      message: e.target.value
    })
  },
  submit: function(evt){
    evt.preventDefault();
    this.props.socket.emit('message', this.state.message)
    var newArr = this.state.messages.slice();
    var messageObj = {username: this.props.socket.username, content: this.state.message};
    newArr.push(messageObj)
    this.setState({
      message: '',
      messages: newArr
    });
    console.log(this.state.messages);
  },
  render: function() {
    return (
      <div>
      <ul>
      {this.state.messages.map((x)=> <li>{x.username}: {x.content}</li>)}
      </ul>
      <div>
      <form onSubmit={this.submit}>
      <input type='text' onChange={this.updateString} value={this.state.message}></input>
      <button type='submit' value = 'submit'>Submit</button>
      </form>
      </div>
      </div>
    );
  }
})

var ChatRoomSelector = React.createClass({
  handleClick: function(room){
    this.props.onSwitch(room)
    console.log(room);
  },
  render: function(){
    return (
    <div>
    <ul>
    {this.props.rooms.map((x,i) => <li key={i} onClick={this.handleClick.bind(this, x)}>{x}</li>)}
    </ul>
    </div>
  )}
})

var App = React.createClass({
  getInitialState: function(){
    return {
      socket: io(),
      roomName: 'Party Place',
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.state.socket.username = prompt('What is your username');
      this.state.socket.emit('username', this.state.socket.username)
      this.state.socket.emit('room', this.state.roomName)
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message)
    }.bind(this));

  },
  join: function(room) {
    this.setState({
      roomName: room
    })
  },
  render: function() {
    return (
      <div>
      <h1>React Chat</h1>
      <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join.bind(this)}/>
      <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
      Join the Party Place
      </button>
      <ChatRoom socket={this.state.socket} name={this.state.roomName}/>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
