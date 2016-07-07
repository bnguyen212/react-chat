var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    return {
      socket: io(),
      roomName: "No room selected!",
    }   
  },
  componentDidMount: function() {
    var username = "Lucas";
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      this.state.socket.username = username;
      // YOUR CODE HERE (2)
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
        alert(message)
    }.bind(this));

  },
  join: function(room) {
    // room is called with "Party Place"
    console.log(room);
  },
  render: function() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, "Party Place")}>
          Join the Party Place
        </button>
        <ChatRoom name={this.state.roomName} socket={this.state.socket}/>
      </div>
    );
  }
});

var ChatRoom = React.createClass({
  getInitialState: function(){
    return {
      message: '',
      messages: []
    }
  },
  recieveMessage: function(message) {
    this.setState({
      messages: this.state.messages.concat([message])
    })
  },
  componentDidMount: function(){
    alert(this.props.socket.message);
    this.props.socket.on('message', this.receiveMessage)
  },
  // componentWillReceiveProps: function(nextProps){
  //   this.props.socket.on('room', function (e) {
  //         e.preventDefault();
  //         socket.emit('room', {
  //             name: nextProps.name
  //         });
  //         // socket.on('my other event', function (data) {
  //         //   console.log(data);
  //         // });
  //       });
  //   if (this.props.name != nextProps.name) {
  //     this.setState({
  //       roomName: nextProps.name,
  //       messages: []
  //     })
  //   } 
  // },
  render: function(){
    return (
      <div>

      </div>
      )
  }

});

ReactDOM.render(<App />, document.getElementById('root'));
