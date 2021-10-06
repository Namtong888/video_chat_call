const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
// const myVideo = document.getElementById("my-video");
const myVideo = document.createElement("video");
const videoshare = document.getElementById("sharecreen");
var local_stream;
var currentPeer = null;
var screenSharing = false;
const myPeer = new Peer();

myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    local_stream = stream;
    myPeer.on("call", (call) => {
      call.answer(local_stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      currentPeer = call;
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg) => {
      console.log(msg);
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });

  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  currentPeer = call;
  call.on("close", () => {
    video.remove();
  });
  console.log(call);
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
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

// chia sẻ màng hình
function showscreen() {
  document.getElementById("sharecreen").hidden = false;
}
function unshowscreen() {
  document.getElementById("sharecreen").hidden = true;
}

function startScreenShare() {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    showscreen();
    local_stream = stream;
    addVideoStream(videoshare, local_stream);

    console.log(local_stream);
  });
  myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
  });
}

function stopScreenSharing() {
  unshowscreen();
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
