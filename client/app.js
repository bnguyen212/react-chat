import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName:"Vanguard",
      username:"",
      rooms:['Vanguard','Mavericks','Warriors','Democrats']
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var name= prompt('Enter username');
      this.setState({username:name});
      this.state.socket.emit('username',this.state.username);
      this.state.socket.emit('room',this.state.roomName);

    });

    this.state.socket.on('errorMessage', message => {
      alert(message)
    });
  }

  join(room) {
    this.state.socket.emit('noTyping',true)
    this.setState({roomName:room})//async
    this.state.socket.emit('room',room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>

        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={(name)=>this.join(name)} />
        <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
      </div>
    );
  }
}

class ChatRoomSelector extends React.Component{
  render(){
    return(
      <div>
        {this.props.rooms.map((room) => <button className="btn btn-default" onClick={() =>
          {this.props.onSwitch(room)}
        }>
          {room}
        </button>)}
      </div>


    )
  }

}

class ChatRoom extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      message:"",
      messages:[],
      typing:[],
    };
    this.handleSubmit=this.handleSubmit.bind(this);
    this.handleMessageChange=this.handleMessageChange.bind(this);
  }

  componentDidMount(){
    this.props.socket.on('message',message=>{

      var msg= `${message.username}: ${message.content}`;
      var msgarray=this.state.messages;
      msgarray.push(msg);

      this.setState({messages:msgarray})
    }

    );

    this.props.socket.on('typing',(data) =>{
      console.log(data)
        if(this.state.typing.indexOf(data.username)===-1){
          var user=this.state.typing;
          user.push(data.username);
          this.setState({'typing':user})

        }
    })

    this.props.socket.on('noTyping',(data)=>{

      var users=this.state.typing;
      var ind=users.indexOf(data.username);
      if(ind>-1){
        users.splice(ind,1)
        this.setState({'typing':users})

      }


    })




  }

  componentWillReceiveProps(nextProps){
    if(nextProps.roomName!==this.props.roomName){

      this.setState({messages:[],typing:[]});

    }
  }

  handleMessageChange(e){
    var msg=e.target.value;
    this.setState({message:msg});
    this.props.socket.emit('typing',true)
  }

  handleSubmit(e){
    e.preventDefault();
    var msgarray=this.state.messages;
    var msg=`${this.props.username}: ${this.state.message}`;
    msgarray.push(msg);
    this.setState({messages:msgarray,message:""})
    this.props.socket.emit('message',this.state.message)
    this.props.socket.emit('noTyping',true)
  }

  render(){


    return(
      <div>

      <ul>
        {this.state.messages.map((ms) => <li>{ms}</li>)}
      </ul>


      <div>
        {this.state.typing.map((type)=><span>{type}  </span>)} {this.state.typing.length>1 ? 'are typing...' : null} {this.state.typing.length == 1 ? 'is typing...' : null}
      </div>


      <form
        onSubmit={(e) => this.handleSubmit(e)}
       >
        <input
          type="text"
          placeholder={this.state.message}
          onChange={(e) => this.handleMessageChange(e)}
          value={this.state.message}
        />

        <input
          type="submit"
          value="Send"
         />
      </form>

    </div>


    )
  }


}


ReactDOM.render(<App />, document.getElementById('root'));
