import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "No room selected!",
      username: null,
    };
  }

  getUsername(promptMessage){
    let username = prompt(promptMessage);
    this.state.socket.emit('username', username);
    this.setState({username: username});
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      this.getUsername("Hi there! What's your username?");
      if(this.state.username){
        //valid session
      }
    });

    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      if(message === "No username!"){
        this.getUsername("Invalid username. Please enter another!")
        if(this.state.username){
          //valid session
        }

      }
    });
  }

  join(room) {
    // room is called with "Party Place"
    console.log(room);
  }

  render() {
    return (
      <div>
        <h1>React Chat</h1>
        <button className="btn btn-default" onClick={() => this.join("Party Place")}>
          Join the Party Place
        </button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
