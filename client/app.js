import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName:"Room1",
      username:"",
      rooms:["Room1","Room2","Room3"],
    };
    this.join = this.join.bind(this)
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      var username = prompt("please input your username");
      this.setState({username:username});
      this.state.socket.emit('username',username);
      this.state.socket.emit('room',this.state.roomName);
      // YOUR CODE HERE (2)
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message)
    });
  }

  join(room) {
    this.setState({roomName:room});
    this.state.socket.emit('room',this.state.roomName);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector roomName={this.state.roomName} rooms={this.state.rooms} join={this.join}/>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message:"",
      messages:[],
    }
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    console.log("message")
    this.props.socket.on('message',message => {
      var newMessage = `${message.username}:${message.content}`;
      console.log(newMessage)
      var newMessageArr = this.state.messages.concat(newMessage)
      this.setState({messages:newMessageArr});
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.roomName !== nextProps.roomName) {
      this.setState({messages:[]})
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    var newMessage = `${this.props.username}: ${this.state.message}`;
    var newMessageArr = this.state.messages.concat(newMessage);
    this.setState({messages:newMessageArr});
    this.setState({message:""});
    this.props.socket.emit('message',
    {
      "username": this.props.username,
      "content": this.state.message.toString(),
    })
  }

  handleMessage(e) {
    this.setState({message:e.target.value.toString()})
  }

  render() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <ul>
        {this.state.messages.map((message)=> (<li>{message}</li>))}
        </ul>
        <input
          type="text"
          placeholder="new message"
          onChange={(e) => this.handleMessage(e)}
          value={this.state.message}
         />
        <input
          type="submit"
          value="Send"
         />
      </form>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms:this.props.rooms,
      // YOUR CODE HERE (1)
      roomName:this.props.roomName,
      onSwitch:this.props.join,
    }
  }

  render() {
    return (
      <ul className="nav nav-tabs">
        {this.state.rooms.map((room)=>
          <li role="presentation" className={this.state.roomName === room ? "active":""} key={room}
            onClick={() => { this.props.join(room)}}
        >{room}</li>
        )}
      </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
