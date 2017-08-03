import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'Welcome Room',
      username: '',
      rooms: ["Welcome Room", "Good Eats", "Night Owls", "Coffee Connoisseurs", "Do You Even Lift?"]
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      // YOUR CODE HERE (2)
      var username = prompt('Please enter a username');
      this.setState({username: username});
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert("ERROR " + message);
    });

  }

  join(room) {
    // room is called with "Party Place"
    this.setState({roomName: room});
    this.state.socket.emit('room', room);
  }

  render() {
    return (
      <div>
        <h1>Get A (Chat)Room</h1>
        <p>Get A (Chat)Room is a place for you to plan social events interested in the same activity as you!</p>
        <div>
          <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={(room) => this.join(room)}/>
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
      typing: []
    }
  }
  componentDidMount() {
    this.props.socket.on("message", (message) => {
      this.state.messages.push({username: message.username, content: message.content});
      this.setState({messages: this.state.messages});
    });

    this.props.socket.on('typing', user => {
      if (this.state.typing.indexOf(user) < 0) {
        this.state.typing.push(user);
        this.setState({typing: this.state.typing})
      }
    });

    this.props.socket.on('stop typing', user => {
      var index = this.state.typing.indexOf(user);
      this.state.typing.splice(index, 1);
      this.setState({typing: this.state.typing})
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.roomName !== nextProps.roomName) {
      this.setState({messages: []});
    }
  }
  messageChange(e) {
    e.preventDefault();
    this.props.socket.emit('typing', {username: this.props.username});
    this.setState({message: e.target.value});
    if (!e.target.value) {
      this.props.socket.emit('stop typing', {username: this.props.username});
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.socket.emit('message', this.state.message);
    this.state.messages.push({username: message.username, content: message.content});
    this.setState({messages: this.state.messages, message: ""});
    this.props.socket.emit('stop typing', {username: this.props.username});
  }

  render() {
    return (
      <div className='chatroom'>
        <h1>{this.props.roomName}</h1>
        <ul>
          {this.state.messages.map(msgObj => {
            return (
              <div className='row'>
                <p><b>{msgObj.username}:</b>{msgObj.content}</p>
              </div>
            );
          })}
        </ul>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div>{this.state.typing.map(user => {
            return user + " is typing..."
          })}
          </div>
          <div className="form-group">
            <input type="text" name="message" value={this.state.message} placeholder="Your message..." onChange={e => this.messageChange(e)}></input>
            <input className="btn btn-primary" type="submit" name="send" value="Send"></input>
          </div>
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
            return (
              <li role="presentation" key ={room} className='active' onClick={() => {
                this.props.onSwitch(room)
              }}>
                <a href="#">{room}</a>
              </li>
            )
          } else {
            return (
              <li key={room} role="presentation" onClick={() => {
                this.props.onSwitch(room)
              }}>
                <a href="#">{room}</a>
              </li>
            )
          }

        })}
      </ul>
    )
  }
}

ReactDOM.render(
  <App/>, document.getElementById('root'));
