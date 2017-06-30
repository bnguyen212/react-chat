import React from 'react';
import ReactDOM from 'react-dom';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      message: '',
      messages: []
    }
    this.handleSubmit=this.handleSubmit.bind(this);
    this.handleMessageChange=this.handleMessageChange.bind(this);
  }

  componentDidMount(){

    this.props.socket.on('message', (message) => {
      var messArr = this.state.messages.concat(`${message.username}: ${message.content}`);
      this.setState({messages: messArr});
    });
  }

  componentWillReceiveProps(nextProps){
    if (this.props.roomName !== nextProps.roomName){
      this.setState({messages:[]});
    }
  }
  // var roomName = this.props.roomName;
  // var username = this.props.username;
  handleSubmit(e){
    e.preventDefault();
    // var messArr = this.state.messages;
    var newMessage = this.state.messages.slice();
    newMessage.push(this.props.username + ': ' + this.state.message);
    // newMessage.push
    this.setState({messages: newMessage})
    this.props.socket.emit('message', this.state.message);
    this.props.socket.emit('stopTyping');
  }


  handleMessageChange(e){
    var messageInput = e.target.value;
    this.setState({message: messageInput});
    this.props.socket.emit('typing');
  }

  render(){
    return (
      <div>
        <div className="messageBox">
          <header className="messageBoxHeader"> Messages!</header>
          <div>
            {this.state.messages.map((message, i) => {
              return (<p key={i} className="thisName">{message}</p>);
            })}
          </div>
          <ul>
          {this.props.typing.map((person, i) => {
            return <li key={i}>{person}</li>
          })}
        </ul>
        </div>
        <form className="container row">
          <div className="input-group">
            <input type="text" placeholder="Send a message!" className="form-control" onChange={(e) => this.handleMessageChange(e)} value={this.state.message}></input>
            <span className="input-group-btn">
              <input type="submit" className="btn btn-default" onClick={(e) => this.handleSubmit(e)}></input>
            </span>
          </div>
        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component{
  constructor(props){
    super(props);
    var currentRoom = this.props.roomName;
    // this.state={
    //   room: currentRoom
    // }

  }
  render(){
    return (
      <div>
      <ul className="nav nav-tabs">
        {this.props.rooms.map((room, i) => {
          // var now = new Date().getTime() + room.trim(' ');
          var thisRoom = this.props.roomName;
          return (
            <li key={i} role="presentation" className= {(room === thisRoom)?"active" : ''} onClick={() => {
              this.props.onSwitch({room});
              // this.setState({room: room})
            }}><a href="#">{room}</a></li>
          );
        })}
      </ul>

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
      roomName: 'Room 1',
      rooms: ['Room 1', 'Room 2', 'Party people'],
      typing: ['1', '2']
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt('Please enter a username');
      this.setState({username: username});
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert('Error: ' + message);
    });

    this.state.socket.on('stopTyping', () => {
        var arrTyping=this.state.typing.slice();
        var removeIndex= arrTyping.indexOf(arrTyping);
        arrTyping.splice(removeIndex,1);
        this.setState({typing: arrTyping})
      })

      this.state.socket.on('typing', () => {
        var arrTyping=this.state.typing.slice();
        if (arrTyping.indexOf(this.state.username) > -1) {
          return;
        }
        arrTyping.push(this.state.username)
        this.setState({typing: arrTyping})
      })

  }

  join(room) {
    // room is called with "Party Place"
    this.setState({roomName: room});
    this.state.socket.emit('room', room);
    console.log(room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
        <ChatRoomSelector
          rooms={this.state.rooms}
          roomName={this.state.roomName}
          onSwitch={this.join}
        />
        <ChatRoom
          socket={this.state.socket}
          roomName={this.state.roomName}
          username={this.state.username}
          typing={this.state.typing}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
