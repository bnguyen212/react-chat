import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'Room 1',
      rooms:['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Party Place'],
      username: ''
      // YOUR CODE HERE (1)
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    var self = this;
    self.state.socket.on('connect', () => {
      console.log('Connected to the Chat Server!');
      var username = prompt('Please Enter a Username');
      var user = username.trim();
      user = user.charAt(0).toUpperCase() + user.slice(1);
      this.state.socket.emit('username',user);
      this.state.socket.emit('room', this.state.roomName);
      self.setState({username: user});

    });

    this.state.socket.on('errorMessage', message => {
      setTimeout(() => this.state.socket.disconnect(true), 1000);
      alert("ERROR: "+message);

    });
    self.state.socket.on('disconnect', () => {
      self.state.socket.open();

    });
  }

  join(room) {
    // room is called with "Party Place"
    // console.log(room);
    this.state.socket.emit('room', room);
    this.setState({
      roomName:room
    })
  }

  render() {
    var styles={
      "height":"450px"
    }
    var stylesMain={
      "paddingTop":"5px",
    }
    var theme;
    ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Party Place']
    switch (this.state.roomName){
    case 'Room 1':
      theme = "panel panel-primary"
      break;
    case 'Room 2':
      theme = "panel panel-info"
      break;
    case 'Room 3':
      theme = "panel panel-warning"
      break;
    case 'Room 4':
      theme = "panel panel-success"
      break;
    case 'Party Place':
      theme = "panel panel-danger"
      break;
    default:
      theme = "panel panel-default"
    }
    return (
      <div>
        <h1 style={{"textAlign":"center"}}>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join} />
          <div className={"mainbox"} style={stylesMain}>
              <div className={theme} style={styles}>
                  <div className={"panel-heading"}>
                      <div className={"panel-title"}>React Chat ({this.state.roomName})</div>
                  </div>
                  <div className={"panel-body"} >
                    <span></span>
                    <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
                  </div>
              </div>
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
      messages: [],
      users:[]
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount(){
    var self = this;
    this.props.socket.on('message', (message)=>{
      var newMess =`${message.username}: ${message.content}`
      var messages = self.state.messages
      messages.push(newMess)
      self.setState({
        messages:messages
      })
    })
    self.props.socket.on('typing',(username)=>{
      if (this.state.users.indexOf(username.username) === -1){
        var arr = self.state.users;
        arr.push(username.username);

        self.setState({
          message:event.target.value,
          users:arr
        })

      }
    })
    self.props.socket.on('notTyping',(username)=>{
      if (this.state.users.indexOf(username.username) > -1){
        var arrUser = self.state.users;
        arrUser.splice(self.state.users.indexOf(username.username),1)
        self.setState({
          message:event.target.value,
          users:arrUser
        })

      }
    })

  }
  componentWillReceiveProps(nextProps){
    if (this.props.roomName !== nextProps.roomName){
      this.setState({
        messages: []
      })
    }
  }
  handleSubmit(event){
    event.preventDefault();
    var self = this;
    var newMess =`${this.props.username}: ${this.state.message}`
    var messages = this.state.messages

    messages.push(newMess)
    this.props.socket.emit('notTyping');
    this.props.socket.emit('message', self.state.message);
    this.setState({
      message:'',
      messages:messages
    })
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
  }
  handleChange(event){
    var self= this;

    if (event.target.value === '' || event.target.value === '' || this.state.message === ''){
      this.props.socket.emit('notTyping')
    }
    if (event.target.value !== '' || event.target.value !== ''){
      this.props.socket.emit('typing')
    }

    self.setState({
      message:event.target.value
    })
    var initial = this.state.users.length;
    setTimeout(()=>{
      if (self.state.users.length === initial){
        self.props.socket.emit('notTyping');
      }
    },5000);
  }
  isSelf(message){
    var messSplit = message.split(':')
    if (messSplit[0] === this.props.username){
      return 'sent'
    }else if (messSplit[0] === "System"){
      return 'system'
    }else{
      return 'recieved'
    }
  }
  render(){
    var typing = '';
    if (this.state.users.length === 1){
      typing = " is typing..."
    }else if (this.state.users.length>1){
      typing = " are typing..."
    }
    return(
      <div>
        <div className="body" id="body">
          <div className="messages" id="messages">
            {this.state.messages.map((singleMessage, i)=>
              <div key={i} className={this.isSelf(singleMessage)}>{singleMessage}</div>
            )}
          </div>
          <div className="typing">{this.state.users.map((user)=>user + ', ')}{typing}</div>
        </div>

        <form onSubmit={this.handleSubmit}>
          <center><input type="text" onChange={this.handleChange} value={this.state.message} placeholder={"Type a message..."}/>
          <input className="inputButton" type="Submit" value="Submit" /></center>
        </form>
      </div>
    );
  }
}



class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return(
            <ul className="nav nav-tabs">
              {this.props.rooms.map((room)=>
                <li id={room.id} role={"presentation"} className={this.props.roomName === room ? "active":""} onClick={() => { this.props.onSwitch(room) }}><a>{room}</a></li>
              )}
            </ul>

    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
