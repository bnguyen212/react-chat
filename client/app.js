import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      roomName: 'No room selected!',
      username: "",
    };
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      var username = prompt("Please enter your username!")
      this.setState = ({
        username: username
      });
    });

    this.state.socket.on('errorMessage', message => {
      alert("There was an error: ", message)
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
