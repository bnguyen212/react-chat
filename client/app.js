import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';


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

    return (
      <ul className="nav nav-tabs"> {this.props.rooms.map(wrapItem.bind(this))}  </ul>

    )
  }
}


class ChatRoom extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      message: "",
      messages: [],
      typingusers: []
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addTyper = this.addTyper.bind(this);
    this.removeTyper = this.removeTyper.bind(this);
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
      const msgs = this.state.messages.concat([{username: message.username, content: message.content}]);
      this.setState({messages: msgs})
    })

    this.props.socket.on('typing', usertyping => {
      console.log("received typing event from", usertyping);
      this.addTyper(usertyping);
    } )

    this.props.socket.on('stoptyping', userstoptyping => {
      console.log("received STOP typing event from", userstoptyping);
      this.removeTyper(userstoptyping)
    })

  }

  removeTyper(user){
    const removeindex = this.state.typingusers.indexOf(user);
    if(removeindex!==-1){
      var currenttypers = this.state.typingusers.slice();
      currenttypers.splice(removeindex,1);
      this.setState({typingusers: currenttypers});
    }
  }

  addTyper(user){
    if(this.state.typingusers.indexOf(user)===-1){
      const currentypers = this.state.typingusers.concat([user]);
      this.setState({typingusers: currentypers});
    }

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
    this.props.socket.emit('stoptyping', this.props.username);

  }

  handleChange(event){
    this.setState({message: event.target.value})
    console.log("typing users",this.state.typingusers);
    if(event.target.value.length>0 ){
      console.log("this user is aobut to emit typign event");
      this.props.socket.emit('typing', this.props.username);
    }else{
      this.props.socket.emit('stoptyping', this.props.username)
    }
  }
  render() {

    const divStyle = {
        border: '1px solid black',
        padding: '5px 20px 20px 5px',
        height: '500px',
        position: 'relative'
    };
    var typingstr = "";
    if(this.state.typingusers.length>0){
      typingstr = "is typing";
      this.state.typingusers.forEach( user => {
        typingstr= user+", "+typingstr
      })
    }

    return (
      <div>
      <div style={divStyle}>
        <h4>Welcome to {this.props.roomName} {this.props.username || "!    Please provide a username."}</h4>
        <ul style={{paddingLeft: "10px"}}>
          {this.state.messages.map( msgobj => <p key={_.uniqueId()} >{msgobj.username}: {msgobj.content}</p>)}

        </ul>
        <span style={{bottom:"0", paddingLeft:"5px", position:"absolute", color:"#BBBBBB", fontSize:"larger"}}>{typingstr}</span>
      </div>
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
          <input type="text" className="form-control" value={this.state.message} onChange={this.handleChange} placeholder="Enter message..." style={{height:"50px"}}/>
          <input type="submit" value="Submit" style={{float:"right"}}/>
        </div>
        </form>
      </div>
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
    this.state.socket.emit('room', room);
  }

  render() {
    if(this.state.username){
      return (
        <div>
          <h1>React Chat</h1>
          <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join.bind(this)}/>
          <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
        </div>
      )
    }else{

      return (

        <div>
          <h1>React Chat</h1>
          <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join.bind(this)}/>
          {/* <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/> */}
        </div>
      );

    }

  }
}

ReactDOM.render(<App />, document.getElementById('root'));
