'use strict';

const servers = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
    {
      'urls': 'turn:numb.viagenie.ca',
      'credential': 'password',
      'username': 'email',
    }],
};

const socket = io.connect('http://localhost:3001');
const caller = new RTCPeerConnection(servers);

const constraints = {audio: true, video: true};
navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
  const video = document.querySelector('#localVideo');
  video.srcObject = mediaStream;
  caller.addStream(mediaStream);
}).catch((err) => {
  console.log(err.name + ': ' + err.message);
});

socket.on('message', (data) => {
  console.log('got message from server: '+data);
});
socket.on('connect', () => {
      console.log('socket.io connected!');
});
socket.on('disconnect', () => {
      console.log('socket.io connected!');
});
socket.on('call', (data) => {
  console.log('call received: ' + data);
  caller.setRemoteDescription(
    new RTCSessionDescription(JSON.parse(data)));
  caller.createAnswer().then((call) => {
    caller.setLocalDescription( new RTCSessionDescription(call));
    socket.emit('answer', JSON.stringify(call));
  });
});
socket.on('answer', (data) => {
  console.log('someone answered this: ' + data);
  caller.setRemoteDescription(
    new RTCSessionDescription(JSON.parse(data))
  );
});
socket.on('candidate', (data) => {
  console.log('candidate: ' + data);
  caller.addIceCandidate(
    new RTCIceCandidate(JSON.parse(data).candidate));
});

const sendMsg = () => {
  console.log('send msg');
  let msg = {};
  msg.time = Date.now();
  msg.json = 'json';
  // socket.json.emit('message', msg);
  socket.emit('message', 'Client says: how are you?');
};
setTimeout(sendMsg, 1000);

const makeCall = () => {
  caller.createOffer().then((desc) => {
    caller.setLocalDescription( new RTCSessionDescription(desc));
    console.log('this is send: ' + desc);
    socket.emit('call', JSON.stringify(desc));
  });
  console.log('making call..');
};

document.querySelector('#btnMakeCall').addEventListener('click', makeCall);

caller.onicecandidate = (evt) => {
  if (!evt.candidate) return;
  console.log('onicecandidate called');
  onIceCandidate(evt);
};
// Send the ICE Candidate to the remote peer
const onIceCandidate = (evt) => {
socket.emit('candidate', JSON.stringify({'candidate': evt.candidate}));
};

// onaddstream handler to receive remote
// feed and show in remoteview video element
 caller.onaddstream = (evt) => {
  console.log('onaddstream called');
  document.querySelector('#webVideo').srcObject = evt.stream;
};

