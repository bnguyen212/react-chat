var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  componentDidMount: function() {
    var socket = io();
    socket.on('connect', function() {
      console.log('connected');
    });
  },
  render: function() {
    return <h1>Test</h1>;
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
