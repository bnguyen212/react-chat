import React from 'react';
export default class Chatroom extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      message: '',
      messages: [],
      typing: []
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
  }

  componentDidMount() {
    this.props.socket.emit('room', this.props.roomName);

    this.props.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);

    });

    this.props.socket.on('message', message =>{
      var newMessagesArr = this.state.messages.slice();
      newMessagesArr.push(message);
      this.setState({messages: newMessagesArr});
    });
    this.props.socket.on('typing', username => {
      var newTypingArr = this.state.typing.slice();
      if(newTypingArr.indexOf(username) === -1){
        newTypingArr.push(username);
        this.setState({'typing': newTypingArr}, () => {
          setTimeout(() => {
            console.log("WHAT")
            this.setState({'typing': []});
          }, 3000)
        });
      }

    })

  }

  componentWillReceiveProps(nextProps){
    if(nextProps.roomName !== this.props.roomName){
      this.setState({messages: []})
    }
  }
  submitHandler(event){
    event.preventDefault();
    this.props.socket.emit('message', this.state.message);

    var newMessagesArr= this.state.messages.slice();
    newMessagesArr.push({username: this.props.username, content: this.state.message});
    this.setState({messages: newMessagesArr}, ()=>{
      this.setState({message: ''});
    });
  }
  handleInputChange(event){
    this.setState({message: event.target.value});
    this.props.socket.emit('typing', this.props.username);


  }
  render(){
    const {messages, typing} = this.state;
    return(
      <div className="container messages-container">
        {messages.map((message) => {
          return (
            <p> {message.username}: {message.content} </p>
          )
        })}

        <form className="input-form" onSubmit={this.submitHandler}>
        <div className="row">
        {this.state.typing.map((username) => {
          return <span style={{color: 'grey', marginRight: '10px'}}> {username} is typing... </span>
        })}
        </div>

          <div className="form-group col-sm-10">
            <input type="text" name="message" className="message-input form-control" value={this.state.message} onChange={this.handleInputChange} />
          </div>
          <button type="submit" className="btn btn-info">Send Message</button>
        </form>
      </div>
    )
  }
}
