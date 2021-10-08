const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const share = document.getElementById("my-video");
const myVideo = document.createElement("video");
// const videoshare = document.getElementById("sharecreen");
var local_stream; // video của bạn
var share_stream; // video được chia sẻ
var currentUserId; //

const peers = {};
var share_screen = false;
//
const myPeer = new Peer(); // tạo peer cho người dùng kết nối
 myVideo.muted = true;

// gọi video và hiển thị video lên màng hình.
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    local_stream = stream;
    addVideoStream(myVideo, stream, myPeer.id);
  });

  // document.getElementById("xoa").addEventListener("click", (e)=>{
  //    document.getElementById("nam").hidden =true;
  // });
// khi peer dc mở
myPeer.on("open", (id) => {
  alert("Nhấp Nút 'JOIN' để tham gia trò truyện video call");
  document.getElementById("join").addEventListener("click", (e) => {
    document.getElementById("join").hidden = true;
    document.getElementById("share-screen").hidden = false;
    currentUserId = id;
    socket.emit("join-room", ROOM_ID, id);
  });
});

// nhận kết nối và thực hiện kết nối với room :
socket.on("user-connected", (userId) => {
  connectToNewUser(userId, local_stream);
});

// nghe các cuộc gọi đến
myPeer.on("call", (call) => {
  console.log(call);
  const video = document.createElement("video");
  if (share_screen == true) {
    call.answer(share_stream);
    return;
  } else {
    call.answer(local_stream);
  }
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, call.peer);
  });
  call.on("close", () => {
    video.remove();
  });

});

// khi có ai đố ngắn kết nối
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
  alert(userId + "đã thoát kết nối");
  document.getElementById(userId).hidden = true;
});

// giữ tin nhấn cho người call nhấn enter
document.addEventListener("keydown", (e) => {
  if (e.which === 13 && chatInputBox.value != "") {
    socket.emit("message", {
      msg: chatInputBox.value,
      user: currentUserId,
    });
    chatInputBox.value = "";
  }
});

// nghe tin nhắn được giữ đến và hiển thị lên HTML
socket.on("createMessage", (message) => {
  console.log(message);
  let li = document.createElement("li");
  if (message.user != currentUserId) {
    li.classList.add("otherUser");
    li.innerHTML = `<div id="${currentUserId}"><b  style="font-size: 10px; color: red"> user (<small>${message.user}</small>)  </b></br> ${message.msg}<div>`;
  } else {
    li.innerHTML = `<div id="${currentUserId}" style="text-align: right"><b style="font-size: 10px;  color: red"">you</b></br> ${message.msg}<div>`;
  }
  all_messages.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
});

// thực hiện chia sẻ màng hình
document.getElementById("share-screen").addEventListener("click", (e) => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
    })
    .then((stream) => {
      share_stream = stream;
      // showscreen();
      let vd = document.createElement("video");
      addVideoStream(vd, stream, currentUserId);
      socket.emit("join-room", ROOM_ID, currentUserId);
      share_screen = true;
    });
});

// gọi kết nói :
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId);
  });

  call.on("close", () => {
    video.remove();
  });
  
  peers[userId] = call;
}

// play video
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
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
      document.getElementsByTagName("video")[index].style.height =
        100 / totalUsers + "%";
    }
  }
}
