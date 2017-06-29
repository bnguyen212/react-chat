import React from 'react';
import ReactDOM from 'react-dom';

function Message(props){
  return (
    <tr>
      <td> {props.username} </td>
      <td> {props.content} </td>
    </tr>
  );
}

class ChatRoom extends React.Component {
  // properties passed from APP: socket, roomName, username
  constructor(props){
    super(props);
    this.state = {
      messages: [],
      inputText: '',
    };

    this.handleText = this.handleText.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // set event listeners for the socket
  componentDidMount(){
    this.props.socket.on('message', (message) => {
      let currMessages = this.state.messages.slice();
      currMessages.push(message);
      this.setState({messages: currMessages});
    })
  }

  // if roomChange, then clear messages!
  componentWillReceiveProps(nextProps){
    if(nextProps.roomName !== this.props.roomName){
      this.setState({messages: []});
    }
  }

  handleText(e){
    this.setState({inputText: e.target.value});
  }

  handleSubmit(e){
    e.preventDefault();
    let newMessage = {username: this.props.username, content: this.state.inputText};
    // emit message to everyone else in the room
    this.props.socket.emit('message', newMessage);
    // update our own messageBoard
    let currMessages = this.state.messages.slice().concat(newMessage);
    this.setState({messages: currMessages, inputText: ''});
    // clear value
  }

  render(){
    console.log('messages are', this.state.messages);
    return (
      <div>
        <table>
          <tr>
            <th> Name </th>
            <th> Message </th>
          </tr>
          { this.state.messages.map( (data) => ( Message(data) ) )}
        </table>
        <form onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleText} value={this.state.inputText}/>
          <input type="submit" value="Send"/>
        </form>
      </div>
    );
  }

}

// App component passes on prop to Chatroom component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'No room specified',
      username: '',
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var promptUsername = prompt('Enter your username: ');
      this.setState({username: promptUsername});
      // send username to the server
      this.state.socket.emit('username', promptUsername);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log('Joined', room);
    // set state
    this.setState({roomName: room});
    // specify room to server
    this.state.socket.emit('room', room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
