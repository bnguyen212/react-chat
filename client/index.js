var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "Party Place",
      username: "",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    }   
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      var username = prompt("what is your username");
      this.setState({
        username: username
      })
      this.state.socket.emit('username', username);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      alert(message);
    }.bind(this));

  },
  join: function(room) {
    this.state.socket.emit('room',room);
    this.setState({
      roomName: room,
    })
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector onSwitch={this.join} rooms={this.state.rooms} name={this.state.roomName} />
        <ChatRoom username={this.state.username}socket={this.state.socket} name={this.state.roomName}/>
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function(){
    return {
      message: '',
      messages: []
    }
  },
  componentDidMount: function(){
    var that = this;
    this.props.socket.on('message', function(message){
      that.setState({
        messages: that.state.messages.concat(message)
      })
    });
    

    // this.props.socket.emit('message', this.state.messages);
    // console.log("Messages: ", this.state.messages)
    // console.log("CHATROOM IS BEING CALLED, this socket"  + this.props.socket);
  },
  componentWillReceiveProps: function(nextProps){
    var that = this;
    if(that.props.name !== nextProps.name){
      that.props.socket.emit('room', nextProps.name);
      that.setState({
        messages: [],
        name: nextProps.name
      })
    }
  },
  updateState: function(event){
    // this.state.message = event.target.value;
    this.setState({
      message: event.target.value
    })
  },
  submit: function(event){
    event.preventDefault();
    this.setState({
      message: '',
      messages: this.state.messages.concat({
        username: this.props.username,
        content: this.state.message
      })
    });

    this.props.socket.emit('message', event.target.value);
  },
  render: function(username, socket, name){
    var messages = this.state.messages.map(function(msg, i) {
      return <li className="message" key={i}><h5>{msg.username}</h5><p>{msg.content}</p></li>
    });

    return (
      <div>
        <div>
          <form onSubmit={this.submit}>
            <input id = "messenger" type="text" onChange={this.updateState} value={this.state.message} placeholder="Enter Message ..."/>
            <button type="submit" className="btn btn-default">Send</button>
          </form>
          <div>
          <div className="panel panel-default">
            <div className="panel-body">
              <ul>
                {messages}
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
})

var ChatRoomSelector = React.createClass({
  handleClick: function(roomName){
    this.props.onSwitch(roomName);
  },
  render: function(){
    var that = this;
    var tabs = this.props.rooms.map(function(room,i){
      var name = null;
      if(room === that.props.name) {name = "active"}
      
      return <li key={i} role="presentation" className ={name} onClick={that.handleClick.bind(that, room)}><a href="#">{room}</a></li>
    })
    return (
      <div>
        <nav className="navbar navbar-default">
          <ul className="nav navbar-nav">
            {tabs}
          </ul>
        </nav>
      </div>
    )

  }
})

ReactDOM.render(<App />, document.getElementById('root'));
