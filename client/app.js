import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [],
      statusMessage: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('message', (message) => {
      var messages = this.state.messages.slice();
      messages.push(message.username + ': ' + message.content);
      this.setState({messages:messages});
    });

    this.props.socket.on('errorMessage', (errorMessage) => {
      alert('Error: ' + errorMessage);
    });

    this.props.socket.on('typing', (data) => {
      console.log('typing');
      this.setState({statusMessage: data});
    });

    this.props.socket.on('stop typing', () => {
      console.log('stopped typing');
      this.setState({statusMessage: ''});
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.roomName !== this.props.roomName) {
      this.setState({messages: []});
    }
  }

  handleChange(event) {
    this.setState({message: event.target.value});
    if (event.target.value === '') {
      this.props.socket.emit('stop typing');
    } else {
      this.props.socket.emit('typing', this.props.username + ' is typing...');
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.socket.emit('message', this.state.message);
    var messages = this.state.messages.slice();
    messages.push(this.props.username + ': ' + this.state.message);
    this.setState({message: '', messages: messages});
    this.props.socket.emit('not typing');
  }

  render() {
    if (this.props.roomName === 'No room Selected!') {
      return (
        <div>
        </div>
      )
    }
    return (
      <div>
        <div className="col-md-6 box">
          <div className="textbox">{this.state.messages.map((msg, index) => (<p key={index} className="message"> {msg} </p>))}</div>
          <div className="statusMessage">{this.state.statusMessage}</div>
          <form className="inputbox block" onChange={(e) => this.handleChange(e)} onSubmit={(e) => this.handleSubmit(e)}>
            <input className="inline typebox" type="text" placeholder="Say Something..." value={this.state.message}></input>
            <button className="inline submitbutton">Send</button>
          </form>
        </div>
    </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          {this.props.rooms.map((room) => {
            if (this.props.roomName === room) {
              return <li key={room} role="presentation" className="active"><a href="#">{room}</a></li>
            } else {
              return <li key={room} onClick={() => {this.props.onSwitch(room)}} role="presentation"><a href="#">{room}</a></li>
            }
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
      roomName: 'Moore 100',
      rooms: ['Moore 100', 'Niel 420', 'Doty 212'],
      username: null,
      alertMessage: ''
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt('Enter a username here: ');
      //var username = "andrew";
      this.setState({username: username});
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert('Error: ' + message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    this.setState({roomName: room, alertMessage: 'Welcome to ' + room + ', ' + this.state.username});
    this.state.socket.emit('room', room);
  }

  render() {

    return (
      <div>
        <h1>React Chat</h1>
        {(this.state.alertMessage !== '') ? <div className="alert alert-success alert-dismissable">{this.state.alertMessage}<a href="#" class="close" data-dismiss="alert" aria-label="close">x</a></div>: <div> </div>}
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join} />
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

