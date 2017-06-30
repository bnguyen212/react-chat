import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: "Room 1",
      username: "",
      rooms: ['Room 1', 'Room 2', 'Room 3'],
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var username = prompt('Enter Username...');
      this.setState({username: username})
      this.state.socket.emit('username',username);
      // this.state.socket.emit('room', this.state.roomName);

    });

    this.state.socket.on('errorMessage', message => {
      console.log("there was an error: ", message)
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log('joined room',  room.element)
    this.setState({roomName: room.element})
    this.state.socket.emit('room', room.element);

  }


  render() {
    return (
      <div>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.join.bind(this)}/>
        <ChatRoom socket={this.state.socket} roomName={this.state.room} username={this.state.username}/>
        <h1>React Chat</h1>
      </div>
    );
  }
}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      messages: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
  }

  componentDidMount(){
    console.log('this.state is ddd  ' , this.state);
    this.props.socket.on('message', (m) => {
      console.log('connected');
      var newArr = this.state.messages.slice();
      newArr.push({username: m.username, content: m.content})
      this.setState({
        messages: newArr
      })
      console.log('this.state' + this.state)
      console.log('conent ' + m.content)
    });
  }

  componentWillReceiveProps(nextProps) {
    // console.log('f')
    if(nextProps.roomName === this.props.roomName) {
      this.setState({
        messages: [],
      })
    }
  }


  handleSubmit(e) {
    e.preventDefault();
    this.props.socket.emit('message', this.state.message);
    var newArr = this.state.messages.slice();
    var username= this.props.username;
    var content = this.state.message;

    newArr.push({username : username,  content: content})
    this.setState({
      messages: newArr,
      message: ''
    })
  }
  handleContentChange(e){
    this.setState({ message: e.target.value })
  }

  render() {
    var currentUser = this.props.username;
    return(
      <div>

        {this.state.messages.map((message, index) => <li key={index}> {message.username}: {message.content}</li>)}
        <form
          onSubmit={(e) => this.handleSubmit(e)} >
          <input
         type="text"
         placeholder="enter some content"
         onChange={(e) => this.handleContentChange(e)}
         value={this.state.message} />

         <input
          type="submit"
          value="Submit"
         />

        </form>
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props){
    super(props)
  }
  render() {
    return(
      <div className="row">
        <div className="col s12">
          <ul className="tabs">
            {this.props.rooms.map((element, index) => <li key={index} className="tab col s3" onClick={() => { this.props.onSwitch({element}) }}><a>{element}</a></li>)}
          </ul>
        </div>
      </div>
    )
  }
}









ReactDOM.render(<App />, document.getElementById('root'));
