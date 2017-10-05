import React from 'react';
import ReactDOM from 'react-dom';
import Chatroom from './chatroom';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'Party Room',
      username: '',
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("Please enter a username");
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName);
      this.setState({username: username});
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
      var username= prompt("Please enter a username again");
      this.state.socket.emit('username', username);

    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({roomName: room});
    this.state.socket.emit('room', room);
  }


  render() {
    const {rooms, roomName} = this.state;
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-primary" style={{marginRight: '30px'}} onClick={this.createRoom}>Create Room </button>
        {rooms.map((room) => {
          if(room === roomName){
            return (
              <button className="btn btn-default" style={{marginRight: '20px', backgroundColor: '#e6e6e6'}} onClick={() => this.join(room)}>
              Join the {room}
              </button>
            )
          } else{
            return (
              <button className="btn btn-default" style={{marginRight: '20px'}} onClick={() => this.join(room)}>
              Join the {room}
              </button>
            )
          }

        })}

        <Chatroom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
