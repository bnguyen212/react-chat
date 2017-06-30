import React from 'react';
import ReactDOM from 'react-dom';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: "#prepwork",
      username: 'anon',
      rooms: ["#prepwork", "HorStarterz", "WHOREizons", "Full_Stack"]
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      const username = prompt('enter username!');
      this.setState({ username: username })
      this.state.socket.emit('username', username)
      this.state.socket.emit('room', this.state.roomName)
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({ roomName: room.room });
    this.state.socket.emit('room', this.state.roomName);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join}/>
        {/* <button className="btn btn-default" onClick={() => this.join("#prepwork")}>
          Join #prepwork
        </button> */}
        <ChatRoom username={this.state.username} socket={this.state.socket} roomName={this.state.roomName}/>
      </div>
    );
  }
}
//once rendered, pass in username
class ChatRoom extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      message: '',
      messages: []
    }
    this.handleNewMessage.bind(this);
    this.handleSubmit.bind(this);
  };
  componentDidMount(){
    this.props.socket.on('message', (message) => {
      var newMessage =  message.username + ': ' + message.content;
      this.setState({ messages: this.state.messages.concat([newMessage])
      });
      // alert(this.state.messages)
    });
  }

  componentWillReceiveProps(nextProps){
    if(this.props.roomName !== nextProps.roomName){
      this.setState({ messages: [] });
    }
  }

  handleNewMessage(e){
    event.preventDefault();
    this.setState({message: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({messages: this.state.messages.concat([this.props.username + ': ' + this.state.message])})
    this.props.socket.emit('message', this.state.message);
    this.setState({message: ''});
  }

  render(){
    return(
      <div className="col-md-6 box">
      <div className="textbox">
        {this.state.messages.map(msg => <div className='msg'>{msg}</div>)}
      </div>
        <form className="inputbox block" onSubmit={(e) => this.handleSubmit(e)}>
          <input onChange={(e) => this.handleNewMessage(e)} id="text" className="inline typebox" type="text" placeholder="Say Something..." value={this.state.message}/>
          <button id="send" className="inline submitbutton" type="submit">Send</button>
        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return(
    <ul className="nav nav-tabs nav-justified">
      {this.props.rooms.map((room) => <li className={this.props.roomName === room ? "active" : ""} role="presentation" onClick={() => this.props.onSwitch({room})}><a>{room}</a></li>)}
    </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
