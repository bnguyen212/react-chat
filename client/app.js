import React from 'react';
import ReactDOM from 'react-dom';

class ChatRoomSelector extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <ul className="nav nav-tabs" >
        {this.props.rooms.map((roomName)=>(
          <li role="presentation" className={this.props.roomName===roomName ? "active" : ""}
          onClick={()=>this.props.onSwitch(roomName)}>
            <a href="#">
              {roomName}
            </a>
          </li>
        ))}
      </ul>
    )
  }
}

class ChatRoom extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      message: '',
      messages: [],
      editing: false,
      timeOutId: false,
      editMessage: ''
    }
    this.updateMessageInput = this.updateMessageInput.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
    this.handleStartEdit = this.handleStartEdit.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount(){
    this.props.socket.on('message',message=>{
      this.setState({
        message: '',
        messages: this.state.messages.concat(`${message.username}: ${message.content}`)
      });
    });

    this.props.socket.on('edit',data => {
      this.setState({
        editMessage: data.editStart ? `${data.username} is typing...` : ''
      })
    });
  }

  componentWillReceiveProps(nextProps){
    if(this.props.roomName !== nextProps.roomName){
      this.setState({
        messages: []
      })
    }
  }

  handleStartEdit(event){
    if(!this.state.timeOutId){
      this.props.socket.emit('edit',{editStart:true,username:this.props.username,roomName:this.props.roomName});
    }
    else{
      clearTimeout(this.state.timeOutId);
    }
    this.setState({
      timeOutId: setTimeout(()=>{this.props.socket.emit('edit',{editStart:false,username:this.props.username,roomName:this.props.roomName});this.setState({timeOutId: false});},1000)
    });
  }

  updateMessageInput(event){
    this.handleStartEdit(event);
    this.setState({
      message: event.target.value
    });
  }

  handleMessageSubmit(event){
    event.preventDefault();
    this.props.socket.emit('edit',{editStart:false,username:this.props.username,roomName:this.props.roomName})
    var message = this.state.message;
    this.setState({
      message: '',
      messages: this.state.messages.concat(`${this.props.username}: ${message}`)
    },()=>{
      this.props.socket.emit('message',{username:this.props.username,content:message});
    });
  }

  render(){
    return (
      <div>
        <ul>
          {this.state.messages.map((message, index)=>(<li key={index}>{message}</li>))}
        </ul>
        <div className="typeMessageContainer">{this.state.editMessage}</div>
        <form onSubmit={this.handleMessageSubmit}>
          <input type="text" onChange={this.updateMessageInput} value={this.state.message}/>
          <input type="submit" value="Submit"/>
        </form>
      </div>

    )
  }

}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: "Party Place",
      username: '',
      rooms: ["Party Place","Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
    };
  }

  componentDidMount() {
    this.state.socket.on('connect', () => {
      console.log('connected');
      var newUsername = prompt('Type in a username.');
      this.setState({
        username : newUsername
      },()=>{
        this.state.socket.emit('username', newUsername);
        this.state.socket.emit('room',this.state.roomName);
      });
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }

  join(room) {
    this.setState({
      roomName: room
    },()=>{
      this.state.socket.emit('room',this.state.roomName);
    });
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={(roomName)=>this.join(roomName)}/>
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
