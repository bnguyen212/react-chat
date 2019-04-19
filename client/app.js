import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'Venus',
      username: null,
      rooms: ["Venus", "Mercury", "Mars", "Jupiter", "Saturn"]
    };
    this.signup = this.signup.bind(this);
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected to server');
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    //console.log(room);
    this.state.socket.emit('room', room);
    this.setState({roomName: room})
  }

  signup() {
    var username = window.prompt("Please enter a username:");
    this.state.socket.emit("username", username);
    //this.state.socket.username = username;
    this.setState({username: username}, () => this.join(this.state.roomName));
  }

  render() {

    return (
      <div>
        <h1>Brian's React Chat</h1>

        {this.state.username ? <div className="alert alert-success"><strong>Welcome, {this.state.username}!</strong></div> : (<div><button className="btn btn-warning" onClick={this.signup}>
          Choose Usename
        </button></div>)}

        {this.state.username ? <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join} /> : null}

        {this.state.roomName && this.state.username ? <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} /> : ''}
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [{username: 'System', content: `${props.username} joined ${props.roomName} room!`}],
      typing: []
    }
    this.submitHandler = this.submitHandler.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('message', message => {
      var newMessagesArr = this.state.messages.slice();
      newMessagesArr.push(message);
      this.setState({messages: newMessagesArr});
    });

    this.props.socket.on('typing', user => {
      var index = this.state.typing.indexOf(user)
      if (index === -1) {
        var newTyping = this.state.typing.slice();
        newTyping.push(user)
        this.setState({typing: newTyping})
      }
    })

    this.props.socket.on('not typing', user => {
      var index = this.state.typing.indexOf(user)
      if (index !== -1) {
        var newTyping = this.state.typing.slice();
        newTyping.splice(index, 1)
        this.setState({typing: newTyping})
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.roomName !== this.props.roomName) {
      this.setState({message: '', typing: [], messages: [{username: 'System', content: `${this.props.username} joined ${nextProps.roomName} room!`}]});
    }
  }

  submitHandler(e) {
    e.preventDefault();
    console.log(this.state.message);
    this.props.socket.emit('message', this.state.message);
    this.props.socket.emit('not typing');
    var newMessagesArr= this.state.messages.slice();
    newMessagesArr.push({username: this.props.username, content: this.state.message});
    this.setState({messages: newMessagesArr}, () => this.setState({message: ''}));
  }

  handleChange(e) {
    if (e.target.value) {
      this.props.socket.emit('typing')
    } else {
      this.props.socket.emit('not typing')
    }
    this.setState({message: e.target.value});
  }

  render() {

    var str = '';
    if(this.state.typing.length === 1) {
      str = this.state.typing[0] + ' is typing...'
    } else if (this.state.typing.length > 1) {
      for (var i = 0; i < this.state.typing.length; i++) {
        str = str + this.state.typing[i] + ', '
      }
      str = str.slice(0, str.length-2) + ' are typing...'
    }

    return (
      <div className="chatroom container border">

        <div className="text-center chat-title"><strong>Welcome to chatroom "{this.props.roomName}"!</strong></div>
        <div className="msg-list border form-control" style={{overflow: 'scroll'}}>
          {this.state.messages.map((msg, i) => (<div className="msg" key={i}><strong>{msg.username}</strong> said: {msg.content}</div>))}
        </div>

        {this.state.typing.length > 0 ? <div className="text-center">{str}</div> : null}

        <form className="chat-input" onSubmit={this.submitHandler}>
          <input type="text" value={this.state.message} className="form-control border input-box" onChange={(e) => this.handleChange(e)} />
          <input type="submit" value="Send" className="msg-btn btn btn-success" />
        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ul className="nav nav-tabs">
      {this.props.rooms.map(room => {
        if (room === this.props.roomName) {
          return (<li key={room} className="active"><a href="#">Join {room} Room!</a></li>)
        } else {
          return (<li  key={room} onClick={() => this.props.onSwitch(room)}><a href="#">Join {room} Room!</a></li>)
        }
      })}
      </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
