import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'The Cool Room',
      username: null,
      rooms: ['The Cool Room', "The Awesome Room", 'The Chill Room']
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('Connected');
      var username = prompt('What is your username?')
      this.setState({username: username});
      this.state.socket.emit('username', this.state.username)
      this.state.socket.emit('room', this.state.roomName)
    });

    this.state.socket.on('errorMessage', message => {
      alert('Error: ' + message)
    });
  }

  join(room) {
    this.setState({roomName: room})
  }

  render() {
    return (
      <div id="all">
        <h3>React Chat</h3>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomNames} onSwitch={(room) => this.join(room)}/>
        {/* <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button> */}
        <div id="chatroom">
            <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
        </div>
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        message: '',
        messages: [],
        typingUsers: [],
    }
  }

  componentDidMount() {
      this.props.socket.on('message', ({username, content}) => {
          const messagesArray = this.state.messages.slice();
          messagesArray.push(`${username}: ${content}`);
          this.setState({messages: messagesArray})
      })
      this.props.socket.on('typing', (username) => {
          console.log(username, 'typing');
          let newArr;
          var exists = this.state.typingUsers.includes(username);
          if (!exists) {
              newArr = this.state.typingUsers.concat(username);
          } else {
              newArr = this.state.typingUsers;
          }
          console.log(exists);
          this.setState({
              typingUsers: newArr,
          });
          console.log(this.state.typingUsers);
      })
      this.props.socket.on('stop-typing', (username) => {
          let index = this.state.typingUsers.indexOf(username);
          let newArr = this.state.typingUsers.slice();
          newArr.splice(index, 1);
          this.setState({
              typingUsers: newArr,
          });
          console.log(this.state.typingUsers);
      })
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.roomName !== this.props.roomName) {
          this.setState({messages:[]})
      }
  }

  handleChange(e) {
      this.setState({message: e.target.value});
      if (e.target.value) {
          this.props.socket.emit('typing', this.props.username)
      }
  }

  handleSubmit(e) {
      e.preventDefault()
      const newMessage = this.state.message;
      this.props.socket.emit('message', newMessage)
      const message = `${this.props.username}: ${newMessage}`
      const messagesArray = this.state.messages.slice();
      messagesArray.push(message);
      this.setState({messages: messagesArray, message: ''})
      this.props.socket.emit('stop-typing', this.props.username)
  }

  render() {
    return (
      <div id="chatroom-inside">
          <div id="list-container" >
              {this.state.messages.map((message) => {
                  var myUsername = this.props.username;
                  var currentUser = message.split(':')[0];
                  if (myUsername === currentUser) {
                      return <div id="my-message" className="message" key={Math.random()+message}>{message}</div>
                  } else {
                      return <div id="their-message" className="message" key={Math.random()+message}>{message}</div>
                  }
              }
              )}
              {this.state.typingUsers.map((user) => (
                  <span>{user} is typing...</span>
              ))}
          </div>
          <form onSubmit={(e) => this.handleSubmit(e)}>
              <input className="textbox" value={this.state.message} type="text" onChange={(e) => this.handleChange(e)}/>
              <input className="submit" type="submit" value="Send" />
          </form>
         <br></br>
      </div>
    );
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
          <ul className="nav nav-tabs">
              {this.props.rooms.map((room) => {
                  if (room === this.props.roomName) {
                      return <li className="nav-item active" onClick={() => {this.props.onSwitch(room)}}><a href="#">{room}</a></li>
                  }
                  else {
                      return <li className="nav-item" onClick={() => {this.props.onSwitch(room)}}><a href="#">{room}</a></li>
                  }
              })}
          </ul>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
