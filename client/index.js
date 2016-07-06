var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "No room selected",
      username:  "No username"
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // save username within socket state for later use
      this.state.socket.username=prompt("What is your username?")
      this.setState({
        username: this.state.socket.username
      })
      this.state.socket.emit('username', this.state.username)
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      if(message==="No username!"){
        this.state.socket.username=prompt("What is your username?")
        this.state.socket.emit('username', this.state.socket.username)
      }
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    //console.log(this)
    console.log(room);
    this.setState({
      roomName: room
    })
    
    //COME BACK FOR ROOM ERROR MESSAGES
    // this.state.socket.on('room',function(room){
    //   this.state.socket.room=room;
    //   if(this.state.socket.room)
    // })
    // this.state.socket.emit('room',this.state.roomName)
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        <ChatRoom username={this.state.username} socket={this.state.socket} name={this.state.roomName}/>
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function(){
    return{
      message: "",
      messages: []
    }
  },
  componentDidMount: function(){
    this.props.socket.on('message', function(message){
      console.log('socket on')
      alert(message)
      //this.state.messages(message)
      this.setState({
      messages: this.state.messages.concat(message)
    })
    }.bind(this))
  },
  componentWillReceiveProps: function(nextProps){
    if(this.props.name!==nextProps.name){
      this.props.socket.emit('room',nextProps.name)
      this.setState({
        message: "",
        messages: []
       })
    }

  },
  submit: function(){
    //emit to other users
    //io.sockets.in('feed_1').emit('comment', data);
    this.props.socket.emit('message',this.state.message)
    //this.props.socket.emit('message',this.state.message)
    //set state on viewing users
    this.setState({
      message: "",
      messages: this.state.messages.concat({username: this.props.username, content: this.state.message})
    })
    //this.render()
  },
  text: function(event){
    //console.log(event.target.value)
    this.setState({
      message: event.target.value
    })
  },
  render: function(){
    return <div>
    {this.state.messages.map(function(msg){
      return <li><p>User: {msg.username}</p>
                    <p> Content: {msg.content}</p></li>
    })}
    <input type="text" rows="5" value={this.state.message} onChange={this.text}></input>
    <button onClick={this.submit}>Send Message</button>
    </div>
  }
})

ReactDOM.render(<App />, document.getElementById('root'));
