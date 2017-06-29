import React from 'react';
import ReactDOM from 'react-dom';
// import _ from 'underscore';





class ChatRoom extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      message: "",
      messages: []
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.roomName === nextProps.roomName){
      console.log("havent changed rooms, roomane same")
    }else{
      console.log("have changed rooms, clearing messages state");
      this.setState({messages: []})
    }
  }
  componentWillUnmount() {

  }

  componentDidMount() {
    //caled right before chatroom gets rendered
    this.props.socket.on('message', message => {
      // alert(message.user);
      // const msg = `${message.username}: ${message.content}`
      // const messagescopy = this.state.messages.slice();
      const msgs = this.state.messages.concat([{username: message.username, content: message.content}]);
      this.setState({messages: msgs})
    })

  }

  handleSubmit(event){
    event.preventDefault();
    console.log("submittiing message with .emit",this.state.message)
    const msg = this.state.message;
    // const msgs = this.state.messages.slice();
    const msgs = this.state.messages.concat([{username: this.props.username, content: msg}]);
    console.log("messages abotu to ",msgs);
    this.setState({message: '', messages: msgs})
    // this.setState()
    // console.log("messages after submit",this.state.messages);
    this.props.socket.emit('message', msg);

  }

  handleChange(event){
    this.setState({message: event.target.value})
  }
  render() {

    const divStyle = {
        border: '1px solid black',
        padding: '20px',
        height: '500px'
    };

    return (

      <div style={divStyle}>
        <ul>
          {this.state.messages.map( msgobj => <p key={msgobj.username}>{msgobj.username}: {msgobj.content}</p>)}

        </ul>
        <form onSubmit={this.handleSubmit}>
          <label> Enter message</label>
          <input type="text" value={this.state.message} onChange={this.handleChange}/>
          <input type="submit" value="Submit"/>
        </form>
      </div>


    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props){
    super(props);

  }


  render() {
    const wrapItem = function(roomitem){
      if(roomitem === this.props.roomName){
        return <li role="presentation" className="active" onClick={() => { this.props.onSwitch(roomitem) }} key={roomitem}>
                <a href="#">{roomitem}</a>
              </li>
      }
      return <li role="presentation" onClick={() => { this.props.onSwitch(roomitem) }} key={roomitem}>
              <a href="#">{roomitem}</a>
            </li>
    }

    return
      (<ul className="nav nav-tabs"> {this.props.rooms.map(wrapItem.bind(this))}  </ul>
      <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>)

  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "Party Place",
      username: "",
      rooms: ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = window.prompt('Enter a username');
      while(username.trim().length===0){
        console.log("username invalid prompting again");
        username = window.prompt('Invalid: Enter a username');
      }
      this.setState({username: username.trim()});
      this.state.socket.emit('username', username);
      this.state.socket.emit('room', this.state.roomName);

    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
    this.setState({roomName: room});
  }

  render() {


    return (
      <div>
        <h1>React Chat</h1>

        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join.bind(this)}/>
      {/* <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/> */}



      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
