var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  getInitialState: function() {
    socket: io(),
    // YOUR CODE HERE
  },
  componentDidMount: function() {

    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', function() {
      console.log('connected');
      // YOUR CODE HERE
    }.bind(this));

    this.state.socket.on('errorMessage', function(message) {
      // YOUR CODE HERE
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
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
