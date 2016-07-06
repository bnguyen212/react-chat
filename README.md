# Pair programming exercise: React chat

## Goal

The goal of this exercise is to create a simple chat application using React and WebSockets. Using components, you will implement functionality to enter a room, send messages, receive messages, and change rooms.

## Part 0: A WebSockets Reference

> **Note:** Give this a quick overview and refer back to this section later to determine what events to emit and when!

Below is a reference to all WebSockets events that you will be listening for and emitting for the purpose of chat. A WebSockets chat server has already been set up for you on the same server that is serving up your React application. 

<sub>**Send** indicates a WebSockets event that goes from Client (your browser, running a React application) to Server (your Node application, running a WebSockets server). **Receive** denotes a WebSockets event that goes from Server to Client.</sub>

* **Send:** `username` - This must be the first event emitted after a successful socket connection; no other events will work unless a username has been emitted and stored.
	* _Emit_ with a String that represents your username
	* _Will emit_ `errorMessage` with "No username!" if the username is invalid. Duplicate usernames are permissible.
* **Send:** `room` - This event will be used for both connecting to a room initially and changing between rooms.
	* _Emit_ with a String that represents the room you want to join
	* _Will emit_ `errorMessage` with "No room!" if you do not pass in anything to the `room` event	
	* _Will emit_ `errorMessage` with "Username not set!" if no username has been set yet.
* **Send:** `message` - This event will be used for sending messages to the server to be sent to the rest of the room.
	* _Emit_ with a String that represents the contents of the message you want to send.
	* **Note:** You must handle displaying your own messages that you send - your own messages _will not_ be broadcast back to you.
* **Receive:** `message` - This event will be used for all messages sent - you will only receive this event for messages sent in the current room you are in (set by sending a `room` event).
	* _Will emit_ an **Object** (important!) that has a property `username` indicating who the message is coming from and property `content` containing the message's text contents
		* **Example:**
		
		```
		{
			"username": "Ethan",
			"content": "Did you commit today?"
		}
		```
		* **Note:** All user join events will automatically broadcast a message coming from "System" that looks like "_a user_ has joined". You can test if your `message` receiving handlers are working by having multiple "users" join a room on different tabs of your browser.
* **Receive:** `errorMessage` - This event will be sent from the server for any errors. Listen for this event on the client to handle errors such as "Username not set!"
	* _Will emit_ back with any error messages for the client


Remember: all WebSockets events are received like the following:

```
this.socket.on('eventName', function(dataFromEvent) {
	// Do something with dataFromEvent
})
```

and all WebSockets events are sent like the following:

```
this.socket.emit('eventName', 'dataToSend');
```

Note that we already handled connections for you and stored the socket object on `this` - the root `<App />` component.

## Part 1: Chat component

For Part 1, you will be working with one chat room, sending and receiving messages from a group of users that are connected to a single room. The end result of **Part 1** should look something like the following:

<img src="img/chat1.png" width="600">

Begin by designing a component called `<ChatRoom />` 

`<App />`

`<ChatRoom />`
- Send message form
- Message list view

## Part 2: Multi-room chat

<img src="img/chat2.png" width="600">

<ChatRoomSelector />

- Add required `name` prop for `ChatRoom`
- `componentDidMount()` on ChatRoom join channel
- `componentWillUnmount()` disconnects/leaves channel

## Challenge: "User is typing"

<img src="img/chat3.png" width="600">
