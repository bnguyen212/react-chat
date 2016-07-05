var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  componentDidMount: function() {
    this.socket = io();
    this.socket.on('connect', function() {
      console.log('connected');
    });
  },
  join: function(room) {
    if (! room) {
      throw new ('Room missing');
    }
  },
  render: function() {
    return (
      <div>
        <h1>Test</h1>
        <button className="btn btn-default" onClick={this.join.bind(this, 1)}>Join room 1</button>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
