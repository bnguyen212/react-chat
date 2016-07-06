var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      'socket': io(),
      'roomName': 'cesspit',
      'username': null,
      'rooms': ['cesspit', 'h4k€®∫', 'Sayre\'s Quinoa', 'Pokemon Go']
    }   
  },
  componentDidMount: function() {
    var s = this.state.socket
    // WebSockets Receiving Event Handlers
    s.on('connect', function() {
      console.log('connected');
      this.setState({'username':prompt("Enter your username")})
      s.emit('username', this.state.username)
      this.join.bind(this, this.state.roomName).call()
    }.bind(this));

    s.on('errorMessage', function(message) {
      alert(message)
      s.username = prompt("Enter your username")
      s.emit('username', s.username)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    this.setState({'roomName':room})
    this.state.socket.emit('room', room)
  },
  render: function() {

    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} name={this.state.roomName} onSwitch={this.join}/>
        {this.state.roomName && this.state.username ?
          <ChatRoom room={this.state.roomName} socket={this.state.socket} username={this.state.username}/> : null} 
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {
      'message': '',
      'messages': [],
    }
  },
  componentDidMount: function() {
    // socket events
    var s = this.props.socket

    s.on('message', function(message) {
      this.setState({'messages': this.state.messages.concat([message])})
    }.bind(this))
  },
  componentWillReceiveProps: function(next) {
    if (next.room!==this.props.room) {
      console.log('new room!!')
      this.props.socket.emit('room', next.room)
      this.setState({'messages': []})
      console.log('changing to ',next.room)
    }
  },
  send: function(e) {
    e.preventDefault()
    var msg = {
      'username' : this.props.username,
      'content' : this.state.message
    }
    this.setState({'message' : ''})
    this.props.socket.emit('message', msg.content)
    this.setState({'messages' : [msg].concat(this.state.messages)})
  },
  doesathing: function(e) {
    this.setState({'message' : e.target.value})
  },
  render: function() {
    if (!this.props.room || !this.props.username) return <div/>
    return <div>
      <form>
        <div className="form-group">
          <input id="message" className="form-control" placeholder="enter message here" onChange={this.doesathing} value={this.state.message}/>
          <button className="btn btn-default" onClick={this.send}>Submit</button>
        </div>
      </form>
      <div className="message-container">
        {this.state.messages.map(function(elt, index) {
          return <div className="message" key={index}>
            <h5>{elt.username}:</h5>
            <p>{elt.content}</p>
          </div>
        })}
      </div>
    </div>
  }
})

var ChatRoomSelector = React.createClass({
  handleClick: function(e) {
    e.preventDefault()
    this.props.onSwitch(e.target.innerHTML)
  },
  render: function() {
    console.log(this.props.rooms)
    return <ul className="nav nav-tabs">
      {this.props.rooms.map(function(elt, index) {
        return <li key={elt+index} role="presentation" className={elt===this.props.name ? 'active' : ''}>
        <a onClick={this.handleClick}>{elt}</a>
        </li>
      }, this)}
    </ul>
  }
  
})

ReactDOM.render(<App />, document.getElementById('root'));
// ReactDOM.render(<ChatRoom socket={this.state.socket} name={this.state.roomName} />, document.getElementById('root'));
