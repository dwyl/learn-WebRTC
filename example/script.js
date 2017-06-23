var startForm = document.querySelector('.start-form');
var videoChat = document.querySelector('.video-chat');

var webrtc;

startForm.addEventListener('submit', function(event) {
  event.preventDefault();
  startForm.style.display = 'none';
  videoChat.style.display = 'initial';
  var nickname = event.target[1].value;
  var roomName = event.target[0].value;
  webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotesVideos',
    // immediately ask for camera access
    autoRequestMedia: true,
    nick: nickname,
  });
  // we have to wait until it's ready
  webrtc.on('readyToCall', function() {
    // you can name it anything
    webrtc.joinRoom(roomName);
  });

  //this is how you listen for messages sent out by sendDirectlyToAll
  webrtc.on('channelMessage', (label, type, data) => {
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
  //sendDirectlyToAll sends over webRTC where sendToAll sends via sockets, so if we want to send peer to peer rather than via a server we use this.
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

function addToChat(name, message) {
  var newText = document.createElement('p');
  newText.textContent = name + ': ' + message;
  document.querySelector('body').appendChild(newText);
}
