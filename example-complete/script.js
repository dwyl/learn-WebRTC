// get the set up form and the chat elements from the DOM
var startForm = document.querySelector('.start-form');
var videoChat = document.querySelector('.video-chat');

var webrtc; //initialise webrtc variable so it is avalable globally

startForm.addEventListener('submit', function(event) {
  event.preventDefault();
  startForm.style.display = 'none'; //hide the start form
  videoChat.style.display = 'initial'; //show the chat page
  var nickname = event.target[1].value;
  var roomName = event.target[0].value;
  webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotesVideos',
    // immediately ask for camera access
    autoRequestMedia: true,
    // What media to send, defaults to both being true, we're putting audio false to stop any feedback loops or annoying sound stuff
    media: { video: true, audio: false },
    // the name which will be sent with any data
    nick: nickname,
  });
  // we have to wait until it's ready
  webrtc.on('readyToCall', function() {
    // The name of the room to join. SimpleWebRTC uses a default server to connect people, which we're using for this demo, so any rooms will be public, and if anyone joins a room with the same name, will be included in your chat.
    webrtc.joinRoom(roomName);
  });

  //this is how you listen for messages sent out by sendDirectlyToAll
  webrtc.on('channelMessage', function(label, type, data) {
    // This will be an object containing a 'payload' key with the value of the object passed to as the 3rd argument to sendDirectlyToAll
    //  and a 'type' key with a value of the string passed as the second argument to sendDirectlyToAll
    console.log('data', data);
    // This will be an object containig information about the request
    console.log('label', label);
    // This will be a string of the second argument to sendDirectlyToAll
    console.log('type', type);

    // if so we only do things with the dtatype we are expecting
    if (data.type === 'chat') {
      // create text element with the value being sent
      addToChat(label.nick, data.payload.message);
    }
  });
});

document.getElementById('message-form').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log(e.target[0].value);
  var content = e.target[0].value;
  // if content isn't blank send a message
  if (content) {
    /*
    sendDirectlyToAll sends over webRTC where sendToAll sends via sockets, so if we want to send peer to peer rather than via a server we use this.

    The first and second arguments can strings of whatever you want, just make sure where you receive the message you look for the same things

    The third argument is an object with any number of key/value pairs you want, which will be sent as the payload to all other users in the room.
    */
    webrtc.sendDirectlyToAll('p2pchat', 'chat', {
      message: content,
    });
    // reset target and value on input to nothing once the message is sent
    e.target[0].placeholder = '';
    e.target[0].value = '';
    // Add your own message to the chat, you want to see both side of the story!
    addToChat('Me', content);
  } else {
    // else tell the user it can't be blank
    e.target[0].placeholder = 'Cannot be blank';
  }
});
// a little function
function addToChat(name, message) {
  var newText = document.createElement('p');
  newText.textContent = name + ': ' + message;
  document.querySelector('.text-chat').appendChild(newText);
}
