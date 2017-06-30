import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: "Room 1",
      rooms: ["Room 1", "Room 2", "Room 3"]
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var username = prompt("Enter a username!");
      console.log(username);
      this.setState({username: username});
      // Can figure out more errors later
      if(!username) {
        this.state.socket.emit('errorMessage');
      }

      this.state.socket.emit('username', username)
    });

    this.state.socket.on('errorMessage', message => {
      console.log(message);
    });
    this.state.socket.emit('room', this.state.roomName);
  }

  join(room) {
    console.log("Joined (room): " + room);
    this.setState({roomName: room})
    this.state.socket.emit('room', room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector
                    rooms={this.state.rooms}
                    roomName={this.state.roomName}
                    onSwitch={this.join}
                  />

        <ChatRoom socket={this.state.socket}
                  roomName={this.state.roomName}
                  username={this.state.username}
                 />
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      messages: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit= this.handleSubmit.bind(this);

  }
  componentDidMount() {
      // Set up the event handlers for the socket we passed in
    this.props.socket.on('message', (message) => {
      var tempArr = this.state.messages.slice();
      tempArr.push(`${message.username}: ${message.content}`);
      this.setState({messages: tempArr});
    });
  }

  componentWillReceiveProps(nextProps) {
    // Compare nextProps to the current props
    if(nextProps.roomName !== this.props.roomName) {
      // Set messages to an empty array
      this.setState({messages: []});
    }
  }

  handleSubmit (event) {
    event.preventDefault();
    var tempArr = this.state.messages.slice();
    tempArr.push(`${this.props.username}: ${this.state.message}`);
    this.props.socket.emit('message', this.state.message)
    this.setState({message: "", messages: tempArr});
  }

  handleChange(event) {
    this.setState({message: event.target.value})
  }

  render() {
    return (
      <div>
        {this.state.messages.map((msg) => (<div key={uuid()}>{msg}</div>))}
        <form onSubmit={this.handleSubmit}>
          <label>Message: </label>
          <input type="text" value={this.state.message}
                             placeholder="Enter msg here..."
                             onChange={this.handleChange}></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  render(){
    return(
      <div>
        <ul className="nav nav-pills nav-stacked">
          {this.props.rooms.map((room) => {
            if(room === this.props.roomName){
              return <li role="presentation"
                         className="active"
                         key={uuid()}
                         onClick={() => {this.props.onSwitch(room)}}> {room} </li>
            }
            return <li role="presentation"
                       key={uuid()}
                       onClick={() => {this.props.onSwitch(room)}}> {room} </li>
          })}
        </ul>
      </div>
    )
  }



}



ReactDOM.render(<App />, document.getElementById('root'));
