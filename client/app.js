import React from 'react';
import ReactDOM from 'react-dom';


class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message : String(),
      messages: Array(),
      typingUser: Array(),
      hehe:['asdasd','adadasd']

    }
  }
  componentDidMount() {
    // console.log("mounted")
    this.props.socket.on('message', message =>{
      // alert('got the message: ' + message);
        let copy = this.state.messages.concat([message.username + ": " + message.content]);
        this.setState({
          messages: copy //  updating an array of object
        })

    })
    var typingMsg = '';
    this.props.socket.on('typing',(username)=>{
       typingMsg = username + ': ' +' is typing';

      if(this.state.typingUser.length === 0 || this.state.typingUser.indexOf(typingMsg) === -1){

        let copy = this.state.typingUser.concat(typingMsg);
        this.setState({
          typingUser: copy //  updating an array of object
        })
        console.log(this.state.typingUser);
      }


    })
    setInterval(()=>{
      console.log(this.state.typingUser);
      if(this.state.typingUser.indexOf(typingMsg)!== -1){
        var list = this.state.typingUser.slice();
        var index = this.state.typingUser.indexOf(typingMsg);
        list.splice(index,1);
        // console.log(list);
        this.setState({
          typingUser : list
        })
        console.log(this.state.typingUser);
        console.log('user deleted');
      }


    },2000);


  }



  handleText(e) {
    e.preventDefault();
    this.setState({
      message: e.target.value
    });

    if(this.state.message){
      this.props.socket.emit('typing');
    }

  }

  handleSubmit (e) {
    e.preventDefault();
    let copy = this.state.messages.concat([this.props.userName + ": " + this.state.message]);
    this.setState({
      messages: copy,
      isT:false,
      message:'' //  updating an array of object
    })
    this.props.socket.emit('message',this.state.message);

  }
  componentWillReceiveProps(nextProps) { // nextProps represents the new comming props from app
    if(this.props.roomName !== nextProps.roomName) {
      this.setState({
        messages : Array()
      })
    }

  }
  render () {
      return (
        <form onSubmit={(e) => this.handleSubmit(e)}>
            <ul>
              {this.state.messages.map((item, index)=><li key={index}>{item}</li>)}
            </ul>
          <div>
            <ul>
            {this.state.typingUser.map((typing, ind)=>
              <li key={ind}> {typing} </li>
            )}
          </ul>
          </div>
         <div>
           <input
             type="text"
             placeholder="text..."
             onChange={(e) => this.handleText(e)}
             value={this.state.message}
           />
           <input
             type="submit"
             value="Send"
           />

         </div>
      </form>

      );
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'Party Place',
      userName: '',
      rooms:  ["Party Place", "Josh's Fun Time", "Sandwich Connoisseurs", "CdT"]
      // YOUR CODE HERE (1)
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var username = prompt('Enter a username');
      this.setState({
        userName:username
      })

      this.state.socket.emit('username',username);
      //
      // this.state.socket.emit('room',this.state.roomName);

      this.join(this.state.roomName)

        // YOUR CODE HERE (3)
      // YOUR CODE HERE (2)
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
    // console.log(this.state.message);
  }

  join(room) {
    this.setState({
      roomName:room
    })
this.state.socket.emit('room',room);

    // room is called with "Party Place"
    console.log("room:",room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>

        <div>
          <ChatRoomSelector
            rooms = {this.state.rooms}
            roomName = {this.state.roomName}
            onSwitch = {this.join}
          />

        </div>

        <div>
          <ChatRoom
            socket = {this.state.socket}
            roomName = {this.state.roomName}
            userName = {this.state.userName}
          />
        </div>

      </div>
    );
  }
}
class ChatRoomSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ul className="nav nav-tabs" >
      {this.props.rooms.map((room)=>
        <li key={room} onClick={() => {this.props.onSwitch(room)}}
        role="presentation" ><a href="#">{room}</a>
        </li>)}
      </ul>
    )
  }
}











ReactDOM.render(<App />, document.getElementById('root'));
