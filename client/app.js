import React from 'react';
import ReactDOM from 'react-dom';

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
        <div className="container-fluid frontPage">
          <h1>React Chat</h1>
          <h3>Welcome to React Chat</h3>
        </div>
        <nav className="navbar navbar-inverse" data-spy="affix" data-offset-top="197">
          <ChatRoomSelector
            rooms={this.state.rooms}
            roomName={this.state.roomName}
            onSwitch={this.join}
          />
        </nav>
        <div>
          <ChatRoom
            username={this.state.username}
            socket={this.state.socket}
            roomName={this.state.roomName}
          />
        </div>
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
    return (
      <div>
        <div class="media">
          <div class="media-body">
            {this.state.messages.map((message) => {
              return (<h4>{message}</h4>)
            })}
          </div>
        </div>
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
          <div className='col-lg-11'>
            <input
              type='text'
              onChange={(e) => {
                this.setState({
                  message: e.target.value
                })
              }}
              value={this.state.message}
              className='form-control mb-2 mr-sm-2 mb-sm-0'
              placeholder='Say something...'
            />
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
        <ul className='nav navbar-nav'>
          {this.props.rooms.map((roomName) => {
            if (roomName === this.props.roomName) {
              return (
                <li
                  role='presentation'
                  className='active'
                  onClick={() => {this.handleClick(roomName)}}>
                  <a href="#">{roomName}</a>
                </li>
              )
            } else {
              return (
                <li
                  role='presentation'
                  onClick={() => {this.handleClick(roomName)}}>
                  <a href="#">{roomName}</a>
                </li>
              )
            }
          })}
        </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
