import React from 'react';
import ReactDOM from 'react-dom';

var counter = 0;

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<ul className="nav nav-tabs">
      {this.props.rooms.map((room) => {
        if (room === this.props.roomName) {
          return (
            <li role="presentation" className="active"><a href="#" onClick={() => {this.props.onSwitch(room)}}>{room}</a></li>
          );
        } else {
          return (
            <li role="presentation"><a href="#" onClick={() => {this.props.onSwitch(room)}}>{room}</a></li>
          );
        }
      })}
    </ul>);
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currMessage: '',
      currentlyTyping: [],
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('message', message => {
      console.log('client message: ' + JSON.stringify(message));
      if (message.content.length > 0) {
      //  alert('submitted!');
        console.log('inside if');
        var messageArr = this.state.messages.slice();
        messageArr = messageArr.concat(message);
      //  alert(this.props.username + ' said ' + this.state.currMessage);
        console.log('new array: ' + JSON.stringify(messageArr));
        this.setState({
          messages: messageArr,
        });
      }
    });

    this.props.socket.on('typing', username => {
      console.log('typing');
      if (!this.state.currentlyTyping.includes(username)) {
        var newArr = this.state.currentlyTyping.slice();
        newArr.push(username);
        this.setState({
          currentlyTyping: newArr,
        });
      }
    });

    this.props.socket.on('stop typing', username => {
      console.log('stop');
      var newArr = this.state.currentlyTyping.slice();
      var index = newArr.indexOf(username);
      if (index !== -1) {
        newArr.splice(index, 1);
      }
      this.setState({
        currentlyTyping: newArr,
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.roomName !== this.props.roomName) {
      this.setState({
        messages: [{
          username: 'System',
          content: `${this.props.username} has joined`,
        }],
      });
    }
  }

  handleSubmit(evt) {
    evt.preventDefault();
    this.props.socket.emit('message', this.state.currMessage);
    this.props.socket.emit('stop typing', this.props.username);
  }

  handleChange(evt) {
    this.setState({
      currMessage: evt.target.value,
    })
    this.props.socket.emit('typing', this.props.username);
  }

  render() {
    return (
      <div className="panel panel-info">
        <div className="panel-heading">CHAT</div>
        <div className="panel-body">
          {this.state.messages.map((message) => <p key={counter++}>{message['username']}: {message['content']}</p>)}
        </div>
        <div className="panel-footer">
          {this.state.currentlyTyping.map((name) => <p key={counter++}>{name} is currently typing...</p>)}
          <form className="form-horizontal" role="form" onSubmit={this.handleSubmit}>
            <div className="input-group" style={{width: '100%'}}>
              <input type="text" className="form-control" value={this.state.value} onChange={this.handleChange}/>
              <input type="submit" value="SEND" className="btn btn-info"/>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io('localhost:3000'),
      // YOUR CODE HERE (1)
      roomName: 'Party Place',
      username: null,
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"],
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt('Enter your username');
      this.state.socket.emit('username', username);
      this.setState({
        username: username,
      });
      this.state.socket.username = username;
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    this.setState({
      roomName: room,
    });
    this.state.socket.emit('room', this.state.roomName);
  }

  render() {
    return (
      <div>
        <center><h1>React Chat!</h1></center>
        {this.state.username ? (
          <div className="alert alert-success">Welcome to React Chat, {this.state.username}!</div>
        ) : (
          <div className="alert alert-warning">User not logged in</div>
        )}
        <ChatRoomSelector rooms={this.state.rooms}
          roomName={this.state.roomName}
          onSwitch={this.join}
        />
      <ChatRoom
        socket={this.state.socket}
        roomName={this.state.roomName}
        username={this.state.username}
      />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
