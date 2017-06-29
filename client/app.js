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
      rooms: ['Party Place', 'Poopy Place', 'Poppies Place', 'Room']
    };

    this.join = this.join.bind(this)
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("Enter a username.");
      this.setState({username: username});
      //emit events here
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message)
    });
  }

  join(room) {
    // room is called with "Party Place"
    this.setState({roomName: room})
    this.state.socket.emit('room', room);
    console.log(room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        {/* <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button> */}
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName}
                onSwitch={this.join}/>
        <ChatRoom socket={this.state.socket} username={this.state.username} roomName={this.state.roomName}/>
      </div>
    );
  }
}


class ChatRoom extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      message: '',
      messages: []
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(e){
    this.setState({message: e.target.value})
  }

  handleSubmit(e){
    e.preventDefault();
    var messagesCopy = this.state.messages.slice();
    messagesCopy.push(`${this.props.username}: ${this.state.message}`)
    this.props.socket.emit('message', this.state.message )
    this.setState({messages: messagesCopy, message: ''})

  }

  componentDidMount(){

    this.props.socket.on('message', (message) => {
      //we do this copy and reset because setState causes it to render again
      var messagesCopy = this.state.messages.slice();
      messagesCopy.push(`${message.username}: ${message.content}`)
      console.log("message rec")
      this.setState({messages: messagesCopy})
    })
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.roomName !== this.props.roomName){
      this.setState({messages: []});
    }
  }

  render(){
    return(
      <div>
        {this.state.messages.map((message) => <p> {message} </p>)}
        <form onSubmit={this.handleSubmit} >
          <input type="text" onChange={this.handleChange} value={this.state.message} ></input>
          <input type="submit" value="Send"></input>
        </form>
    </div>

    )
  }


}


class ChatRoomSelector extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(

      <ul className = "nav nav-tabs">
        {/* <li role="presentation" class="active"><a href="#">Home</a></li> */}
        {this.props.rooms.map((room) =>
          <li role="presentation" onClick = {() =>  this.props.onSwitch(room) }
                  key = {room} class = "active"><a href='#'>  {room}</a></li>)}
      </ul>

    )
  }

}



ReactDOM.render(<App />, document.getElementById('root'));
