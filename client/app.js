import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "CdT",
      username: null,
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    };
    this.join = this.join.bind(this)
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      // YOUR CODE HERE (2)
      this.setState({username: prompt('What is your username?')})
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName)
      console.log('connected:', this.state);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message)
    });
  }

  join(room) {
    this.setState({roomName: room})
    this.state.socket.emit('room', this.state.roomName)
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <div>
          <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
          <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join} />
        </div>
      </div>
    );
  }
}

class ChatRoomSelector extends React.Component {
  render() {
    return (
    <ul className='nav nav-tabs'>
      {this.props.rooms.map((r) => {
      return (
        <li
          className={(r === this.props.roomName) ? 'active btn btn-default' : 'btn btn-default'}
          onClick={() => this.props.onSwitch(r)}
        >{r}
        </li>
      )
      })}
    </ul>
    )
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.roomName !== this.props.roomName)
      this.setState({messages: []})
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
  render() {
    return (<li>{this.props.message}</li>)
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
