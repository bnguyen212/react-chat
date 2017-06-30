import React from 'react';
import ReactDOM from 'react-dom';

function Message(props) {
  return (
    <p>{props.username}: {props.content}</p>
  );
}

class ChatRoom extends React.Component {
  // properties passed from APP: socket, roomName, username
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      inputText: '',
      usersTyping: [],
      isTyping: false
    };

    this.handleText = this.handleText.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // set event listeners for the socket
  componentDidMount() {
    this.props.socket.on('message', (message) => {
      console.log('message is', message);
      let currMessages = this.state.messages.slice();
      currMessages.push(message);
      this.setState({ messages: currMessages });
    })

    this.props.socket.on('typing', (username) => {
      let tempArr = this.state.usersTyping.slice();
      tempArr.push(username);
      this.setState({ usersTyping: tempArr });
    })
    this.props.socket.on('stop typing', (username) => {
      let tempArr = this.state.usersTyping.slice();
      const i = tempArr.indexOf(username);
      tempArr = tempArr.slice(0, i).concat(tempArr.slice(i + 1));
      this.setState({ usersTyping: tempArr });
    })
  }

  // if roomChange, then clear messages!
  componentWillReceiveProps(nextProps) {
    this.setState({ isTyping: false, inputText: '' });
    if (nextProps.roomName !== this.props.roomName) {
      this.setState({ messages: [] });
    }
  }

  handleText(e) {
    console.log(this.state.isTyping)
    this.setState({ inputText: e.target.value });
    if (e.target.value.length > 0 && !this.state.isTyping) {
      this.props.socket.emit('typing');
      this.setState({ isTyping: true })
    } else if (e.target.value.length === 0) {
      this.setState({ isTyping: false })
      this.props.socket.emit('stop typing');
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let newMessage = { username: this.props.username, content: this.state.inputText };
    // emit message to everyone else in the room
    this.props.socket.emit('message', newMessage.content);
    // update our own messageBoard
    let currMessages = this.state.messages.slice().concat(newMessage);
    this.setState({ messages: currMessages, inputText: '', isTyping: false });
    // clear value
    this.props.socket.emit('stop typing');
  }

  render() {
    console.log('messages are', this.state.messages);
    return (
      <div>
        <div className='messaging-ui'>
          <div className='message-board'>
            {this.state.messages.map((data) => (Message(data)))}
          </div>
          {this.state.usersTyping.map((user) => <p>{user} is typing...</p>)}
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className='input-group input-group-lg'>
            <input className='form-control' type="text" onChange={this.handleText} value={this.state.inputText} />
            <div className='input-group-btn'>
              <button className='btn btn-default' type="submit">Send</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <ul className='nav nav-tabs'>
        {this.props.rooms.map((room) => {
          if (room === this.props.roomName) {
            return (
              <li key={room} className='btn btn-default active' onClick={() => this.props.onSwitch(room)}>{room}</li>
            )
          } else {
            return (
              <li key={room} className='btn btn-default' onClick={() => this.props.onSwitch(room)}>{room}</li>
            )
          }
        })}
      </ul>
    )
  }
}

// App component passes on prop to Chatroom component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'Lobby',
      username: '',
      rooms: ['Lobby', 'Party Place', 'Dinosaur Lounge', 'Under the Sea'],
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var promptUsername = prompt('Enter your username: ');
      this.setState({ username: promptUsername });
      // send username to the server
      this.state.socket.emit('username', promptUsername);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log('Joined', room);
    // set state
    this.state.socket.emit('stop typing');
    this.setState({ roomName: room });
    // specify room to server
    this.state.socket.emit('room', room);
  }

  render() {
    return (
      <div className='chatroom'>
        <h1>Super Chat!</h1>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join} />
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
