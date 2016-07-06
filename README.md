# Pair programming exercise: React chat

> A foreword to Windows users: please make sure you are using an LTS version of Node (the latest LTS release is 4.4.7). Verify that you are using the correct version with `node --version`.

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
	* _Will emit_ back with any error messages for the client, could be any one of the following (their meanings speak for themselves):
		* "No username!"
		* "No room!"
		* "Username not set!"
		* "No rooms joined!"
	* _Tip:_ If you want to continually ask your user for a username until they enter a valid (non-empty) username, check if the `errorMessage` data you get back is equal to "No username!" and prompt them again if so. Don't forget to emit the `username` event back to the socket!


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

Note that we already handled connections for you and stored the socket object on `this.state` - the root state of the `<App />` component.

## Part 1: Chat component - `client/index.js`

For Part 1, you will be working with one chat room, sending and receiving messages from a group of users that are connected to a single room. The end result of **Part 1** should look something like the following:

<img src="img/chat1.png" width="600">

Start by implementing some basics that we have given you function definitions for (replace `YOUR CODE HERE`): 

1. Create a property on the return object of `getInitialState` called `roomName` with a default name of a room - because they have not yet selected a room, "No room selected!" is fine.
2. Get and store a username from the user in the callback of the socket's `connect` event - you may use `prompt()` to get input from the user in an easy way!
3. Determine how you will handle errors by filling in the callback function of the socket's `errorMessage` event. `alert()`ing potential errors is sufficient here.

Next, we'll write our logic for sending and receiving messages in a `<ChatRoom />` React component. Notice in **`client/index.js`** that there is already a button setup with an `onClick` event of the `join` function, passing in "Party Place." 

> **Note:** Since we're only dealing with one room at a time for now, calling `join` with only "Party Place" for now is fine - when we design a `<ChatRoomSelector />` component in the next step, we will need to change things.

Change the `join` function so that when it is called, it does not simply log the passed-in room name (`room`), but also calls `setState` to change the room name as a part of the `state` of the top-level `<App />` component - you named this in the first step with `getInitialState` as `roomName`. Remember that we always modify state with the `setState` function!

Next, create a component called `<ChatRoom />` that handles all the logic for sending and receiving messages in its [component lifecycle](https://facebook.github.io/react/docs/component-specs.html) methods. We will pass two props into `ChatRoom` when we render it:

* `socket` - pass `this.state.socket` (from `<App />`) down to its child `<ChatRoom />` so that it can communicate on the same WebSockets connection
* `name` - pass `this.state.roomName` (or whatever name you've set for storing the room name in the state from the previous step, from `<App />`) down to its child `<ChatRoom />` so that the component knows what room name to join and display when it is rendered into the `<App />`.

Now, use the lifecycle methods you learned to change state and the display of the `<ChatRoom />` over time. You may try to design these yourself, or you can follow the spec below:

* `componentDidMount` (called right before a component "mounts" or gets rendered)
	* On `componentDidMount`, 
* `componentWillReceiveProps` (called when receiving new props - i.e., a change of the `name` prop passed in from `<App />`)
* `render` (called to display the component)


## Part 2: Multi-room chat - `client/index.js`

<img src="img/chat2.png" width="600">

<ChatRoomSelector />

- Add required `name` prop for `ChatRoom`
- `componentDidMount()` on ChatRoom join channel
- `componentWillUnmount()` disconnects/leaves channel

## Challenge: "User is typing"

<img src="img/chat3.png" width="600">
