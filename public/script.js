const socket = io('/');
const videoGrid = document.getElementById('video-grid');
var local_stream;
const myPeer = new Peer();
console.log(myPeer);

const myVideo = document.createElement('video')

myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  local_stream = stream;
  myPeer.on('call', call => {
    call.answer(local_stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
// bật tắt video và micro
const playStop = () => {
  let enabled = local_stream.getVideoTracks()[0].enabled;
  if (enabled) {
    local_stream.getVideoTracks()[0].enabled = false;
    document.getElementById("play_video").style.color = "white";
    document.getElementById("play_video").style.background = "red";
  } else {
    local_stream.getVideoTracks()[0].enabled = true;
    document.getElementById("play_video").style.background = "white";
    document.getElementById("play_video").style.color = "black";
  }
};

const muteUnmute = () => {
  const enabled = local_stream.getAudioTracks()[0].enabled;
  if (enabled) {
    local_stream.getAudioTracks()[0].enabled = false;
    document.getElementById("play_micro").style.color = "white";
    document.getElementById("play_micro").style.background = "red";
  } else {
    local_stream.getAudioTracks()[0].enabled = true;
    document.getElementById("play_micro").style.background = "white";
    document.getElementById("play_micro").style.color = "black";
  }
};
