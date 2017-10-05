import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "",
      username: null,
    };
  }

  componentDidMount() {
    console.log("app mounted");
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("Please enter a username")
      this.state.socket.emit('username', username)
      this.setState({username,})
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert("Error: " + message)
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({
      roomName: room,
    })
    this.state.socket.emit('room', room)
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
        <div>
          <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
        </div>
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      message: "",
      messages: [],
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleMessageChange = this.handleMessageChange.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    this.props.socket.emit('message', this.state.message)
    var newMessages = this.state.messages.slice();
    newMessages.push({
      message: this.state.message,
      username: this.props.username,
    })
    this.setState({
      message: "",
      messages: newMessages,
    })
    console.log(this.state);
  }

  handleMessageChange(e) {
    this.setState({
      message: e.target.value,
    })
  }

  componentDidMount() {
    this.props.socket.on('message', ({username, content}) => {
      var messages = [...this.state.messages,`${username}: ${content}`]
      this.setState({
        messages,
      })
      console.log(this.state);
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.roomName !== nextProps.roomName) {
      this.setState({
        messages: [],
      })
    }
  }

  render() {
    return (
      <div>
        <div>{this.props.roomName}</div>
        <div>{this.props.username}</div>
        <div>
          <ul>
            {this.state.messages.map( (item) => (<Message key={item} message={item} />) )}
          </ul>
        </div>
        <form onSubmit={ (e) => this.handleSubmit(e) } >
          <input
            type="text"
            placeholder="message"
            onChange={ (e) => this.handleMessageChange(e) }
            value={this.state.message}
          />
          <input
            type="submit"
            value="Submit"
          />
       </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  
}

class Message extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li>{this.props.message}</li>
    )
  }
}






ReactDOM.render(<App />, document.getElementById('root'));
