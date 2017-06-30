import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      username: null,
      roomName: "Party Place",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("enter username")
      this.setState({username: username})
      username = this.state.username
      this.state.socket.emit('username', username)
      this.state.socket.emit('room', this.state.roomName)
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message)
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    console.log(this.state)
    this.setState({roomName: room})
    //this.state.socket.emit('room', room)
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
        <ChatRoomSelector socket={this.state.socket} roomName={this.state.roomName} rooms={this.state.rooms} onSwitch={this.join.bind(this)} username={this.state.username} />
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      message: "",
      messages: []
    }
  }

  componentDidMount(){
    this.props.socket.on('message', message => {
      this.setState({messages: this.state.messages.concat(`${message.username}: ${message.content}`)})
    })
  }

  componentWillReceiveProps(nextProps){
    if (this.props.roomName !== nextProps.roomName) {
      this.setState({messages: []})
    }
  }

  handleMessageSubmit(e){
    e.preventDefault();
    var message = this.state.message
    console.log(message)
    this.props.socket.emit('message', message)
    this.setState({messages: this.state.messages.concat(`${this.props.username}: ${message}`), message: "" })
    console.log(this.state.messages)
  }

  handleMessageChange(e){
    this.setState({message: e.target.value})
  }

  render() {
    return (
      <div>
        <ul>
          {this.state.messages.map((message) => <li key={message}>{message}</li>)}
        </ul>
        <form
          onSubmit={(e) => this.handleMessageSubmit(e)}
          >
          <input
            type='text'
            placeholder='enter message'
            onChange={(e) => this.handleMessageChange(e)}
            value={this.state.message}
          />
          <input type='submit' value='Send' />
        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props)
  }
  render(){
    return(
      <div>
        <ul className="list-inline">
          {this.props.rooms.map((room) => {
            if(this.props.roomName === room) {
              return <li key={room} className="text-uppercase" onClick={() => {this.props.onSwitch(room)}}>{room}</li>
            } else {
              return <li key={room} onClick={() => {this.props.onSwitch(room)}}>{room}</li>
            }
          })}
        </ul>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
