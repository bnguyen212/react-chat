import React from 'react';
import ReactDOM from 'react-dom';

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }


  render() {
    return (
      <ul className="nav nav-tabs">
        {this.props.rooms.map(
          (currentRoom, index) => {
            return this.props.roomName === currentRoom ?
              <li onClick={ () => {this.props.onSwitch(currentRoom)} } role="presentation" className="active" key={index}><a href="#">{currentRoom}</a></li> :
              <li onClick={ () => {this.props.onSwitch(currentRoom)} } role="presentation" key={index}><a href="#">{currentRoom}</a></li>;
          }
                            )
        }
      </ul>
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
    this.handleMessage = this.handleMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMessage(e) {
    if(e.target.value !== "") {
      this.props.socket.emit('typing');
    } else {
      this.props.socket.emit('stop typing');
    }
    this.setState({
      message: e.target.value,
    });
  }

  handleSubmit(e) {
    if(this.props.username === null) {
      return;
    }
    e.preventDefault();
    let userMessage = {
      username: this.props.username,
      content: this.state.message,
    };
    this.props.socket.emit('message', userMessage.content);
    this.setState(
      (oldState) => (
        {
          message: '',
          messages: oldState.messages.concat(userMessage),
        }
      )
    );
  }

  componentDidMount() {
    this.props.socket.on('message', (messageObj) => {
      //messageObj = {username: String, content: String}
      this.setState( (oldState) => (
        {
          messages: oldState.messages.concat(messageObj),
        }
      ));
    });
    this.props.socket.on('typing', (typingArray) => {
      this.setState({
        typingUsers: typingArray,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    // Clear messages if room name has changed!
    if(nextProps.roomName !== this.props.roomName) {
      this.setState({
        messages: [],
      });
    }
  }

  render() {
    return (
      <div className="view">
        {this.state.messages.map( (messageObj, index) => {
          return (
            <div className="message" key={index}>
              {messageObj.username}: {messageObj.content}
            </div>
          );
        })}
        {this.state.typingUsers.map( (username) => {
          return (
            <span className="typing"> {username} is typing... </span>
          )
        })}
        <form
           onSubmit={this.handleSubmit}>
          <input value={this.state.message} className="messageInput" onChange={this.handleMessage} type="text" placeholder="Message to send"/>
          <input type="submit" value="Send Message"/>
        </form>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'Bikini Bottom',
      username: null,
      rooms: ['Bikini Bottom', 'Ukraine', 'DPRK'],
    };
  }

  getUsername(promptMessage) {
    let username = prompt(promptMessage);
    this.state.socket.emit('username', username);
    this.setState({
      username: username,
    });
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      this.getUsername('Enter your username');
      if(this.state.username) {
        this.state.socket.emit('room', this.state.roomName);
      }
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      if(message === "No username!") {
        this.getUsername('Invalid username, please enter another');
        if(this.state.username) {
          this.state.socket.emit('room', this.state.roomName);
        }
      }
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    this.state.socket.emit('room', room);
    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
    this.setState({
      roomName: room,
    });
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join.bind(this)}/>
        <ChatRoom socket={this.state.socket}
          roomName={this.state.roomName}
          username={this.state.username}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
