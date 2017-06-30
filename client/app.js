import React from 'react';
import ReactDOM from 'react-dom';

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: this.props.socket,
      roomName: this.props.roomName,
      username: this.props.username,
      message: "",
      messages: [],
      typingusers: [],
      users: ['this is a user']
    }
    // console.log('STATE: ',this.state);

  }
  componentDidMount() {
    this.state.socket.on('message', (msgData) => {
      // console.log('reached room on app');

      var newMessages = this.state.messages.slice();
      newMessages.push(`${msgData.username}: ${msgData.content}`);
      this.setState({messages: newMessages});
    });
    this.state.socket.on('typing', (typingData) => {
      if (this.state.typingusers.indexOf(typingData.username) < 0) {
        var newUsers = this.state.typingusers.slice();
        newUsers.push(typingData.username);
        this.setState({typingusers: newUsers});
        // console.log('received typing: ',newUsers,this.state);
      }
    });
    this.state.socket.on('stoptyping', (typingData) => {
      var index = this.state.typingusers.indexOf(typingData.username);
      if (index >= 0) {
        var newUsers = this.state.typingusers.slice();
        newUsers.splice(index, 1);
        this.setState({typingusers: newUsers});
      }
      // console.log('received stop typing: ',this.state);
    });
    // this.state.socket.on('newuser', (data) => {
    //   var newUser = data.username;
    //   if (this.state.users.indexOf(newUser) < 0) {
    //     var newUserArr = this.state.users.slice();
    //     newUserArr.push(newUser);
    //     this.setState({users: newUserArr});
    //   }
    // });
    this.state.socket.on('updateusers', (data) => {
      // var loseUser = data.username;
      // // if (this.state.users.indexOf(loseUser) >= 0) {
      //   var newUserArr = this.state.users.slice();
      //   newUserArr.splice(this.state.users.indexOf(loseUser), 1);
      //   this.setState({users: newUserArr});
      // // }
      this.setState({users: data})
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.roomName !== this.state.roomName) {
      this.setState({roomName: nextProps.roomName, messages: [], typingusers: []});
    }
  }
  handleSubmit(e) {
    e.preventDefault();

    var msg = this.state.message;
    this.state.socket.emit('message', msg);
    // console.log("sent message to server");
    this.setState({message: ""});
    this.state.socket.emit('stoptyping');
    // console.log('emitted stoptyping')
  }
  handleChange(e) {
    var msg = e.target.value;
    this.setState({message: msg});
    this.state.socket.emit('typing');
    // console.log('emitted typing')
  }
  render() {
    return (
      <div id="messages_box">
        <h3 className="text-center">Room {this.state.roomName} Messages</h3>
        <h5> Current users: {this.state.users.map((user, index) => {
          var returnUser = user;
          if (index !== this.state.users.length-1) {
            returnUser += ", ";
          }
          return <span key={index}> {returnUser}</span>
        })}
        </h5>
        <div id="messages">

          {this.state.messages.map((msg, index) => {
            return ( <p key={index}>{msg}</p> );
          })}

          <div>
            {this.state.typingusers.map((user, index) => {
              return <span key={index} className="typing">{user} is typing...</span>
            })}
          </div>

          <form id="new_message" onSubmit={(e) => {this.handleSubmit(e)}}>
            <input
              id="new_message_text"
              type="text"
              placeholder="Type message..."
              value={this.state.message}
              onChange={(e) => {this.handleChange(e)}}
              className="form-control"
            />
            <input
              id="new_message_btn"
              type="submit"
              value="Send"
              className="btn btn-primary"
            />
          </form>
        </div>

      </div>
    );
  }
}

function ChatRoomSelector (props) {
  return (
    <div id="room_buttons" className="text-center">
      {props.rooms.map((roomName) => {
        var classes = "btn btn-default";
        if (roomName === props.roomName) {
          classes += " current_room";
        }
        return <button key={roomName} className={classes} onClick={() => props.onSwitch(roomName)}>
          Room {roomName}
        </button>
      })}
    </div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      rooms: ["1", "2", "3", "4"],
      roomName: "1",
      username: "Guest",
      usernametemp: "Change Username..."
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var user = this.state.username;
      // // while (!user || user.length < 1) {
      // user = prompt("Enter a username: ");
      // this.setState({username: user});
      // // }
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }
  join(room) {
    // console.log(room);
    this.setState({roomName: room});
    this.state.socket.emit('room', room);
    console.log('reaches here in join');
  }
  handleSubmitUsername(e) {
    e.preventDefault();
    this.state.socket.emit('usernamechange', this.state.usernametemp);
    this.setState({username: this.state.usernametemp});
    this.state.socket.emit('username', this.state.usernametemp);
  }
  handleUsername(e) {
    var user = e.target.value;
    this.setState({usernametemp: user});
    // console.log('adds to username', this.state.username);
  }
  render() {
    return (
      <div>
        <h1 id="title">AmandaChat</h1>
        <div id="login_box">
          <h3 className="text-center">logged in as: {this.state.username}</h3>
          {this.state.username==="Guest" &&
          <form id="login" onSubmit={(e) => {this.handleSubmitUsername(e)}}>
            <input
              type="text"
              placeholder="Enter Username..."
              value={this.state.usernametemp}
              onChange={(e) => {this.handleUsername(e)}}
            />
            <input
              type="submit"
              value="Save Username"
            />
          </form>}
        </div>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName}
          onSwitch={(room) => this.join(room)} />
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName}
          username={this.state.username} />

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
// ReactDOM.render(<WholeApp />, document.getElementById('root'));
