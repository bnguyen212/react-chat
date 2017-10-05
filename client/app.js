import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "no roomname",
      username: "no username",
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      this.setState({username: prompt('What is your username?')})
      this.state.socket.emit('username', this.state.username);
      console.log(this.state);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message)
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({roomName: room})
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
          <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
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

  componentDidMount() {
    this.props.socket.on('message', ({username, content}) => {
      this.setState({messages: [...this.state.messages, `${username}: ${content}`]})
    })
  }

  componentWillReceiveProps() {
    this.props.socket.on('room', (room) => {
      if (room !== this.props.roomName)
        this.setState({messages: []})
    })
  }

  handleMessageChange(e) {
    this.setState({message: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('handleSubmit', this.state)
    this.props.socket.emit('message', this.state.message)
  }

  render() {
    return (
      <div>
        <h3>{this.props.roomName}</h3>
        <h4>{this.props.username}</h4>
        <ul>
          {this.state.messages.map((m) => <Message message={m} key={m}/>)}
        </ul>
        <form>
          <input 
            onChange={(e) => this.handleMessageChange(e)}
            type='text'
            placeholder='text'
            name='message'
          />
          <input 
            onClick={(e) => this.handleSubmit(e)}
            type='submit'
            name='submit'
            value='Send'
          />
        </form>
      </div>
    )
  }
}

class Message extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (<li>{this.props.message}</li>)
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
