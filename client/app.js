import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: "Party Place",
      username: null,
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"],
    };
    this.join = this.join.bind(this)
  }

  componentDidMount() {

    this.state.socket.on('connect', () => {
      this.setState({
        username: prompt("Please enter a username"),
      })
      this.state.socket.emit('username', this.state.username)
      this.state.socket.emit('room', this.state.roomName)
    });

    this.state.socket.on('errorMessage', message => {
      alert("Error: " + message)
    });
  }

  join(room) {
    // if (room.room) room = room.room;
    console.log("Joining room: ", room);
    this.setState({
      roomName: room,
    },()=>{
      console.log("In room: ", this.state.roomName);
      this.state.socket.emit('room', room)
    })

  }

  render() {
    return (
      <div>
        <h1>React Chat - {this.state.username}</h1>
        <div>
          <ChatRoomSelector
            socket={this.state.socket}
            rooms={this.state.rooms}
            roomName={this.state.roomName}
            username={this.state.username}
            onSwitch={this.join}
          />
        </div>
        <div>
          <ChatRoom
            socket={this.state.socket}
            roomName={this.state.roomName}
            username={this.state.username}
          />
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
    var messages = [...this.state.messages,`${this.props.username}: ${this.state.message}`]
    this.setState({
      message: "",
      messages,
    })
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
        <div>
          <ul>
            {this.state.messages.map( (item) => (<Message key={Math.random()} message={item} />) )}
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

class Message extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <li>{this.props.message}</li>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className="btn-toolbar" role="toolbar" aria-label="...">
        {this.props.rooms.map( (room) => (<Room
          key={room}
          name={room}
          onClick={ () => {this.props.onSwitch(room)} }
          className={ (room === this.props.roomName) ? "active btn btn-default" : "btn btn-default" }
        />) )}
      </div>
    )
  }
}

class Room extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        onClick={this.props.onClick}
      >
        {this.props.name}
      </button>
    )
  }
}







ReactDOM.render(<App />, document.getElementById('root'));
