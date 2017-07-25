import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: 'Party Place',
      username: '',
      rooms: ['Party Place', 'Second Party Place', 'Third Party Place']
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt('Enter a username', 'user');
      this.setState({
        username: username
      })
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName)
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
    });
  }

  join(room) {
    console.log(room);
    this.setState({
      roomName: room
    })
    //this.state.socket.emit('room', room)
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
        <ChatRoom
          username={this.state.username}
          socket={this.state.socket}
          roomName={this.state.roomName}
        />
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: []
    };
  }
  componentDidMount() {
    var socket = this.props.socket;
    socket.on('message', (message) => {
      var messages = this.state.messages.slice();
      messages.push(message.username + ': ' + message.content);
      this.setState({
        messages: messages
      });
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.roomName !== nextProps.roomName) {
      this.setState({
        roomName: nextProps.roomName
      });
      this.props.socket.emit('room', nextProps.roomName)
    };
  }
  render() {
    anime({
      targets: '.submit',
      left: '80%', // Animate all divs left position to 80%
      opacity: .8, // Animate all divs opacity to .8
      backgroundColor: '#FFF' // Animate all divs background color to #FFF
    });
    return (
      <div>
        <ul>
          {this.state.messages.map((message) => {
            return (<li>{message}</li>)
          })}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(this.state.message);
            this.setState({
              message: '',
              messages: this.state.messages.concat(this.props.username + ': ' + this.state.message)
            });
            this.props.socket.emit('message', this.state.message);
          }}
          className='inline-form'
        >
          <div className='col-md-10'>
            <input type='text' onChange={(e) => {this.setState({message: e.target.value})}} value={this.state.message} className='form-control mb-2 mr-sm-2 mb-sm-0 submit' placeholder='Say something...' />
          </div>
          <button type='submit' className='btn btn-primary'>Submit</button>
        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  handleClick(room) {
    this.props.onSwitch(room);
  }
  render() {
    return (
      <ul className='nav nav-tabs'>
        {this.props.rooms.map((roomName) => {
          if (roomName === this.props.roomName) {
            return (
              <li
                role='presentation'
                className='active'
                onClick={() => {this.handleClick(roomName)}}>
                <a>{roomName}</a>
              </li>
            )
          } else {
            return (
              <li
                role='presentation'
                onClick={() => {this.handleClick(roomName)}}>
                <a>{roomName}</a>
              </li>
            )
          }
        })}
      </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
