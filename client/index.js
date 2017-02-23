var React = require('react');
var ReactDOM = require('react-dom');

var ChatRoom = React.createClass({
  getInitialState: function(){
    return {
      message: '',
      messages:[]
    }
  },
  componentDidMount: function(){
    this.props.socket.on('message', function(message){
      var obj = {};
      console.log(message);
      console.log('RECIEVED A MESSAGE!!!!!');
      obj.messages = this.state.messages.slice(); // ??????????**********??????????
      obj.messages.push(message);
      console.log('*******');
      console.log(obj.messages);
      console.log('*******');
      this.setState(obj);
      console.log('&&&&&&&');
      console.log(this.state.messages);
      console.log('&&&&&&&');
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps){
    if(this.props.name !== nextProps.name){
      //this.props.socket.emit('room', nextProps.name);
      this.setState({
        message:'',
        messages: [],
        name: this.props.name
        //name: nextProps.name // ??????????**********?????????? this wasn't on the original object
      });
    }

  },
  change: function(event){
    var newMessage = event.target.value;

    this.setState({
      message: newMessage
    });

  },
  messageSubmit: function(event){
    event.preventDefault();
    //console.log('Clicked!', this.state.message);
    this.props.socket.emit('message', this.state.message);

    var newMessages = this.state.messages.slice();
    newMessages.push({
      content: this.state.message,
      username: this.props.socket.username
    });

    this.setState({
      messages: newMessages
    });


  },
  render: function(){
    //console.log(this.state.messages);
    return (
      <form onSubmit={this.messageSubmit}>
        <input type="text" value={this.state.message} onChange={this.change} />
        <input type="submit" />
        <ul>{this.state.messages.map((item, i) => {
          return <li key={i}>{item.username}: {item.content}</li>
        })}</ul>
      </form>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "No room selected!"
    }
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE (2)
      var userName = prompt('Please enter username: ');
      console.log('you entered: ', userName);
      this.state.socket.username = userName;
      this.state.socket.emit('username', userName);
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE (3)
      alert('Error: ', message);
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Palace de Blaise"
    // console.log(room, ' rormroromrormo');
    this.setState({
      roomName: room
    });
    this.state.socket.emit('room', room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Palace de Blaise")}>
          Join the Palace de Blaise
        </button>
        <ChatRoom socket={this.state.socket} name={this.state.roomName} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
