# Learn WebRTC (Real-Time Communications)

## Why?

> One of the last major challenges for the web is to enable human communication
via voice and video: Real Time Communication, RTC for short. RTC should be as
natural in a web application as entering text in a text input. Without it, we're
limited in our ability to innovate and develop new ways for people to interact.

> Historically, RTC has been corporate and complex, requiring expensive audio
and video technologies to be licensed or developed in house. Integrating RTC
technology with existing content, data and services has been difficult and time
consuming, particularly on the web. - [Html5Rocks introduction to WebRTC](https://www.html5rocks.com/en/tutorials/webrtc/basics/)

WebRTC tries to address this challenge by providing a common platform for
real-time communication on the web. It hands browsers the ability to directly
communicate without relaying through a server. This in turn enables blazingly
fast, _private_ (in WebRTC encrypted is mandatory) video and audio chat as well
as peer-to-peer data transfer.

## What?

WebRTC uses several JavaScript APIs to connect users and stream audio/video media:

+ getUserMedia() - creates video and audio streams from the user's webcam/mic.
+ RTCPeerConnection() - connects users :heart:
+ RTCDataChannel() - streams data between connected users

Although WebRTC doesn't usually require a web server for its real-time
communication, it does need one to 'introduce' users to each other (known as a
_signaling server_).

In our example we use [SimpleWebRTC](https://simplewebrtc.com/) to negate the
need for a signaling server and to simplify the WebRTC interface. If
you'd like to learn more about vanilla WebRTC API or want to run a signaling
server of your own, check out the [Further Reading section](#reading) below.


## How?
To get started with Web RTC stuff we are using [SimpleWebRTC](https://github.com/andyet/SimpleWebRTC/) which is a great library, it does all of the WebRTC configuration/handshake stuff for you so you can get on to making cool WebRTC stuff! It's still definitely worthwhile to learn the stuff under the hood, but SimpleWebRTC is a good way to start off.

You can run our example to have a look at what you can make with SimpleWebRTC really easily. Just open example-complete/index.html in a browser, type in a nickname and a room name, and then open the same index.html again in another browser window, type in the same room name you used before, and another nickname, and you can talk to yourself using webRTC!

If you prefer to read through the code, just open the index.html in your favourite text editor, it's commented throughout.

If you prefer to have a walkthrough of how to set it up yourself, then follow along!

The basis of this is SimpleWebRTC's great example of how to set up video chat, but adding in text chat as well.

In order for WebRTC to work you need a turn server to match people up with
eachother, SimpleWebRTC has one in as standard, but it is for development **only**.
If you want to make a production app with it you will have to provide your own turn/stun server.

### Step 1.
To start with take a look at the index.html in the example folder, note that it has a `<video>` element, this will be where your own video goes, and a `<div>`  element called `remotes-video`. This div will be the container for any videos coming in you you from other users.
The bit that makes all of this work is
```
<script src="https://simplewebrtc.com/latest-v2.js"></script>
```
This is the SimpleWebRTC javascript file, so make sure to include this if you're going to use it.
You can ignore the `form` and `text-chat` bit for now, we'll use that to send text messages in a bit. To start with, lets get video set up!

### Step 2
In your script.js file add (with whatever you want your nickname to be in here):
```js
var webtrc = new SimpleWebRTC({
  // the id/element dom element that will hold "our" video
  localVideoEl: 'localVideo',
  // the id/element dom element that will hold remote videos
  remoteVideosEl: 'remotesVideos',
  // immediately ask for camera access
  autoRequestMedia: true,
  // What media to send, defaults to both being true, we're putting audio false to stop any feedback loops or annoying sound stuff
  media: { video: true, audio: false },
  // the name which will be sent with any data
  nick: <YOUR-NICKNAME-HERE>,
});

```
this initialises a WebRTC object which will allow you to do stuff.
Underneath that add (with whatever you want your room to be called in the given bit):
```js
webrtc.on('readyToCall', function() {
  // The name of the room to join. SimpleWebRTC uses a default server to connect people, which we're using for this demo, so any rooms will be public, and if anyone joins a room with the same name, will be included in your chat.
  webrtc.joinRoom(<YOUR-ROOM-NAME-HERE>);
});
```
We're just hardcoding the room and nickname for now, but will make that more dynamic later.
If you save this, and open your index.html in two different browser windows, you will have video chat between them! Cool.

### Step 3
Now, lets add in text chat! First off we have to tell our webrtc instance to listen for messages, we do this like this:
```js
webrtc.on('channelMessage', function(){})
```
the function will be called when one of the people in the room calls `sendDirectlyToAll`.
First of all, lets add a function to add new messages to our chat:
```js
function addToChat(name, message) {
  var newText = document.createElement('p');
  newText.textContent = name + ': ' + message;
  document.querySelector('.text-chat').appendChild(newText);
}
```
Then we're going to flesh out the function for receiving messages.
```js
webrtc.on('channelMessage', function(label, type, data){
  if(data.type === 'chat') {
    addToChat(label.nick, data.payload.message)
  }
})
```
If you want to see more of what the arguments passed into the function called on channelMessage then drop a `console.log` in and have a look!
`label.nick` will be the nickname of the person sending a message to you, and `data.payload.message` will be what we send in the next bit we write.

So, let's set up an event listener on our form so we can send messages to eachother!
```js
document.getElementById('message-form').addEventListener('submit', function(event) {})
```
At the top lets add in an
```js
event.preventDefault()
```
this will stop the form from refreshing the page. Then lets get the chat message out.
```js
var content = e.target[0].value;
```
We'll check that it's not blank,and if it is we'll tell the user it can't be blank.

```js
//checks if content is false-y/empty
if (content) {
  //send the message
} else {
  // else tell the user it can't be blank
  e.target[0].placeholder = 'Cannot be blank';
}
```
Now we add in the meat of the messaging function
```js
if (content) {
  /*
  sendDirectlyToAll sends over webRTC where sendToAll sends via sockets, so if we want to send peer to peer rather than via a server we use this.

  The first and second arguments can strings of whatever you want, just make sure where you receive the message you look for the same things

  The third argument is an object with any number of key/value pairs you want, which will be sent as the payload to all other users in the room.
  */
  webrtc.sendDirectlyToAll('p2pchat', 'chat', {
    message: content,
  });
}
```
This will send the message to everyone in the room, now we just want to add a little bit inside of this if branch to make the experience of the chat a bit better.

```js
// reset target and value on input to nothing once the message is sent
e.target[0].placeholder = '';
e.target[0].value = '';
// Add your own message to the chat, you want to see both side of the story!
addToChat('Me', content);
```

so, now you should have something that looks like this:
```js
document.getElementById('message-form').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log(e.target[0].value);
  var content = e.target[0].value;
  if (content) {
    webrtc.sendDirectlyToAll('p2pchat', 'chat', {
      message: content,
    });
    e.target[0].placeholder = '';
    e.target[0].value = '';
    addToChat('Me', content);
  } else {
    e.target[0].placeholder = 'Cannot be blank';
  }
});
```

Now, refresh your two browser windows, and send some messages between the two! Congrats, you just made a video and text chat!

## Further Reading

#### Resources

+ The home of WebRTC: https://webrtc.org/
+ Sample projects and demos: https://webrtc.github.io/samples/
+ simpleWebRTC - a _simple_ interface for WebRTC applications: https://simplewebrtc.com/
+ socket.io p2p - the socket.io implementation of WebRTC: https://github.com/socketio/socket.io-p2p

#### Guides and tutorials

+ A super informative Google codelab introduction to WebRTC: https://codelabs.developers.google.com/codelabs/webrtc-web/#0
+ Html5Rocks on WebRTC: https://www.html5rocks.com/en/tutorials/webrtc/basics/
+ Text chat with WebRTC: https://www.tutorialspoint.com/webrtc/webrtc_text_demo.htm
