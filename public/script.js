const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const share = document.getElementById("my-video");
const myVideo = document.createElement("video");
// const videoshare = document.getElementById("sharecreen");
var local_stream;
var share_stream;
var currentUserId;
var currentPeer;
var screenSharing = false;
const myPeer = new Peer();
var user_stream = [];
let myScreenStream;

myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    local_stream = stream;
    addVideoStream(myVideo, stream, "me");
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      user_stream.push(...userId);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
        });
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (message) => {
      console.log(message);
      let li = document.createElement("li");
      if (message.user != currentUserId) {
        li.classList.add("otherUser");
        li.innerHTML = `<div><b style="font-size: 10px; color: red"> user (<small>${message.user}</small>)  </b></br> ${message.msg}<div>`;
      } else {
        li.innerHTML = `<div style="text-align: right"><b style="font-size: 10px;  color: red"">you</b></br> ${message.msg}<div>`;
      }
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

myPeer.on("call", (call) => {
  call.answer(local_stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

document.getElementById("share-screen").addEventListener("click", (e) => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
    })
    .then((stream) => {
     socket.emit("screen-share", stream);
    });
    socket.on("screenShare", stream => {
      let vd = document.createElement("video");
       addVideoStream(vd , stream , "me")
      // videoGrid.append(vd);
    });
});


socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  currentUserId = id;
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
  currentPeer = call.peerConnection;
}

function addVideoStream(video, stream, uId = "") {
  video.srcObject = stream;
  video.id = uId;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
}
// bật tắt video và micro
const playStop = () => {
  let enabled = local_stream.getVideoTracks()[0].enabled;
  if (enabled) {
    local_stream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    local_stream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const muteUnmute = () => {
  const enabled = local_stream.getAudioTracks()[0].enabled;
  if (enabled) {
    local_stream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    local_stream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};

// chia sẻ màng hình
function showscreen() {
  document.getElementById("sharescreen").hidden = false;
}
function unshowscreen() {
  document.getElementById("sharescreen").hidden = true;
}
function laychim() {
  console.log(user_stream);
}
function startScreenShare() {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    showscreen();
    local_stream = stream;
    addVideoStream(share, local_stream);
    let call = peer.call(ROOM_ID, stream);
    call.on("stream", (stream) => {
      addVideoStream(stream);
    });
  });
}

function stopScreenSharing() {
  unshowscreen();
  const videoTrack = lazyStream.getVideoTracks()[0];
  const sender = currentPeer
    .getSenders()
    .find((s) => s.track.kind === videoTrack.kind);
  sender.replaceTrack(videoTrack);
}

// function startScreenShare() {
//    showscreen();
//    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
//     screenStream = stream;
//     addVideoStream(videoshare, stream);

//     console.log(screenStream);
//   });
// }

//  function stopScreenSharing() {
//    if (!screenSharing) return;
//    unshowscreen();
//    let videoTrack = local_stream.getVideoTracks()[0];

//      let sender = currentPeer.peerConnection.getSenders().find( (s) => {
//       return s.track.kind == videoTrack.kind;
//     });

//     sender.replaceTrack(videoTrack);

//   screenStream.getTracks().forEach(function (track) {
//     track.stop();
//   });
//   screenSharing = false;
// }
