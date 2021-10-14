const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const userjoin = document.getElementById("user_join");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const share = document.getElementById("my-video");
const myVideo = document.createElement("video");
// const videoshare = document.getElementById("sharecreen");
var local_stream; // video của bạn
// video được chia sẻ
var currentUserId; //
// var share_stream;
// var share_video;
const peers = {};
const connet = [];
var share_screen = false;
var videoTracks;
//

let mediaRecorder;
let recordedBlobs;

// var myVideoStream;
//
const myPeer = new Peer();

// tạo peer cho người dùng kết nối
myVideo.muted = true;
// gọi video và hiển thị video lên màng hình.
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    local_stream = stream;
    window.stream = stream;
    addVideoStream(myVideo, stream, myPeer.id);
  });

// khi peer dc mở
myPeer.on("open", (id) => {
  alert("Nhấp Nút 'JOIN' để tham gia trò truyện video call");
  document.getElementById("join").addEventListener("click", (e) => {
    document.getElementById("join").hidden = true;
    document.getElementById("share-screen").hidden = false;
    currentUserId = id;
    socket.emit("join-room", ROOM_ID, id);
    document.getElementById("live").hidden = false;
    document.getElementById("chat").hidden = false;
    document.getElementById("User").hidden = false;
  });
});

// nhận kết nối và thực hiện kết nối với room :
socket.on("user-connected", (userId) => {
  connectToNewUser(userId, local_stream);
  user_join(userId);
  alert(userId + " đã tham gia cuộc hộp");
  if (share_screen == true) {
    share_now(videoTracks);
  }
});

// user tham gia cuôc họp;
function user_join(user) {
  let li = document.createElement("li");
  if (user != currentUserId) {
    li.id="user_"+user;
    li.innerHTML = `<div class="mess"  style="border: 0.1 solid;  border-radius: 20px; background: honeydew;"><b  style="font-size: 14px; color: red; margin-left:10px"> user(<small>${user}</small>) </b><div>`;
  } else {
    li.id="user_"+ currentUserId;
    li.innerHTML = `<div class="mess" style="text-align: right; border: 0.1 solid;  border-radius: 20px; background: moccasin;"><b style="font-size: 14px; color: red; margin-right:10px">you</b><div>`;
  }
  userjoin.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
}

// nghe các cuộc gọi đến
myPeer.on("call", (call) => {
  console.log(call);
  const video = document.createElement("video");
  call.answer(local_stream);
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, call.peer);
  });
  user_join(call.peer);
  connet.push(call.peerConnection);
  console.log(connet);
});

// khi có ai đố ngắn kết nối
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
  alert(userId + "đã thoát kết nối");
  document.getElementById(userId).remove();
  var user = "user_"+userId;
  document.getElementById(user).remove();
});

// hiện giá mang hinh share
socket.on("screenShare", (users) => {
  var share_video = document.getElementById(users);
  share_video.width = 1000;
  share_video.float = "right";
  videoGrid.textLine = center;
});

socket.on("stop--Share", (users) => {
  var video = document.getElementById(users);
  video.width = 350;
  video.float = "left";
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
  const chat_i = document.getElementById("chat_i");
  let li = document.createElement("li");
  if (message.user != currentUserId) {
    chat_i.hidden = false;
    li.classList.add("otherUser");
    li.innerHTML = `<div class="mess" id="${currentUserId}" style="border: 0.1 solid;  border-radius: 20px; background: honeydew;"><b  style="font-size: 8px; color: red; margin-left:5px"> user(<small>${message.user}</small>) </b></br><span style="font-size: 13px; margin-left:10px;"> ${message.msg}</span><div>`;
  } else {
    li.innerHTML = `<div class="mess" id="${currentUserId}" style="text-align: right; border: 0.1 solid;  border-radius: 20px; background: moccasin;"><b style="font-size: 8px; color: red; margin-right:5px">you</b></br> <span style="font-size: 13px; margin-right:10px;"> ${message.msg}</span><div>`;
  }
  all_messages.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
});

// thực hiện chia sẻ màng hình
// document.getElementById("share-screen").addEventListener("click", (e) => {
//   navigator.mediaDevices
//     .getDisplayMedia({
//       video: true,
//     })
//     .then((stream) => {
//       share_stream = stream;
//       // showscreen();
//       share.srcObject = stream;
//       share.id = currentUserId;
//       share.addEventListener("loadedmetadata", () => {
//         share.play();
//       });
//       socket.emit("join-room", ROOM_ID, currentUserId);
//       share_screen = true;
//     });
// });

// gọi kết nói :
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId);
  });
  connet.push(call.peerConnection);
  currentPeer = call.peerConnection;
  peers[userId] = call;
  console.log(connet);
}

// play video
function addVideoStream(video, stream, uId = "") {
  video.srcObject = stream;
  video.id = uId;
  video.className = "video-call";
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
  video.width = 350;
  video.float = "left";
  videoGrid.scrollTop = videoGrid.scrollHeight;
  //  let totalUsers = document.getElementsByClassName("video-call").length;
  //   if (totalUsers > 1) {
  //      for (let index = 0; index < totalUsers; index++) {
  //        document.getElementsByClassName("video-call")[index].style.width =
  //        100 / totalUsers + "%";
  //      }
  //    }
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
  // let totalUsers = document.getElementsByClassName("video-call").length;
  // if (totalUsers > 1) {
  //   for (let index = 0; index < totalUsers; index++) {
  //     document.getElementsByClassName("video-call")[index].style.width =
  //       100 / totalUsers + "%";

  //   }
  // }
}
//

//chia se mang hinh  nha -----------------
// const sharecreen = async () => {
//   navigator.mediaDevices
//     .getDisplayMedia({
//       video: true,
//     })
//     .then((stream) => {
//       local_stream = stream;
//     });

//   connet.forEach((element) => {
//     let sender = element.getSenders().find(function (s) {
//       return s.track.kind == videoTrack.kind;
//     });
//     sender.replaceTrack(videoTrack);
//     console.log(element);
//   });

//   share_screen = true;
// };

//cach 1: ------------------------------------------------
// const sharecreen = () => {
//   navigator.mediaDevices
//     .getDisplayMedia({
//       video: true,
//     })
//     .then((stream) => {
//       localLiveStream = stream;
//       document.getElementById("my-video").srcObject = localLiveStream;
//       document.getElementById("my-video").play();
//       connect_share();
//       // let videoTrack = localLiveStream.getVideoTracks()[0];
//       // videoTrack.onended = () => {
//       //   stopScreenSharing();
//       // };
//       // connet.forEach((element) => {
//       //   let sender = element.getSenders().find(function (s) {
//       //     return s.track.kind == videoTrack.kind;
//       //   });
//       //   sender.replaceTrack(videoTrack);
//       //   console.log(element);
//       // });
//     });
//   chiasemanghinh = true;
// };

function connect_share() {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    var share__video__stream = document.createElement("video");
    share__video__stream.id = "sharevideostreamm";
    share__video__stream.width = 300;
    share__video__stream.srcObject = stream;
    share__video__stream.play();
    videoGrid.append(share__video__stream);

    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTracks = videoTrack;
    videoTrack.onended = () => {
      stopScreenSharing();
    };
    share_now(videoTrack);
  });

  share_screen = true;
}

function share_now(videoTrack) {
  socket.emit("screen-share", currentUserId);
  connet.forEach((element) => {
    let sender = element.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
    console.log(element);
  });
  document.getElementById(currentUserId).hidden = true;
}

function stopScreenSharing() {
  let videoTrack = local_stream.getVideoTracks()[0];
  connet.forEach((element) => {
    let sender = element.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  });
  // local_stream.getTracks().forEach(function (track) {
  //   track.stop();
  // });
  socket.emit("stop-share", currentUserId);
  document.getElementById(currentUserId).hidden = false;
  document.getElementById("sharevideostreamm").remove();
  share_screen = false;
}

//  document.getElementById("share-screen").addEventListener("click", (e) => {
//    navigator.mediaDevices
//      .getDisplayMedia({
//        video: true,
//    })
//      .then((stream) => {
//       share_stream = stream;
//        addVideoStreamshare(share, stream);
//      });

//    socket.emit("join-room", ROOM_ID, myPeer.id);

//    function addVideoStreamshare(video2, stream) {
//     video2.srcObject = stream;
//     video2.addEventListener("loadedmetadata", () => {
//       video2.play();
//     });
//   }
//   share_stream = true;
// });

const recordButton = document.querySelector("button#record");

function live() {
  navigator.mediaDevices
    .getDisplayMedia({ video: true, audio: true })
    .then((stream) => {
      window.stream = stream;
    });
  document.getElementById("Record").hidden = false;
  document.getElementById("live").hidden = true;
}

function recoding() {
  startRecording();
  console.log("chạy");
  document.getElementById("stopRecording").hidden = false;
  document.getElementById("Record").hidden = true;
}

function startRecording() {
  recordedBlobs = [];
  let options = { mimeType: "video/webm;codecs=vp9,opus" };
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error("Exception while creating MediaRecorder:", e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(
      e
    )}`;
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder, "with options", options);

  mediaRecorder.onstop = (event) => {
    console.log("Recorder stopped: ", event);
    console.log("Recorded Blobs: ", recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log("MediaRecorder started", mediaRecorder);
}
function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function stopRecording() {
  mediaRecorder.stop();
  document.getElementById("download").hidden = false;
  document.getElementById("Record").hidden = true;
  document.getElementById("stopRecording").hidden = true;
}

function download() {
  const blob = new Blob(recordedBlobs, { type: "video/mp4" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "video_call.mp4";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
  document.getElementById("Record").hidden = false;
  document.getElementById("stopRecording").hidden = true;
  document.getElementById("download").hidden = false;
}

// js cho trang web
