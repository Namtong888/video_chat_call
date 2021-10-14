var room_id;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
var send = document.getElementById("input");


room_id = Math.floor(Math.random() * 9999 + 1000);
var input = document.getElementById("peer_id");
input.value = room_id;
// var input = document.getElementById("room-input");
// input.value = a;
peer = new Peer(room_id);
peer.on("open", (id) => {
  console.log("Peer Connected with ID: ", id);
  callClick();
  notify("Vui lòng Không Đổi Your Id || Nhập Friend_Id để Call video với Bạn bè.");
});

function callClick() {
  let room = document.getElementById("Friend_id").value;
  if (room == " " || room == "") {
    return;
  }
  if (room == room_id) {
    alert("Không thể call với chính bạn");
    let friend = document.getElementById("Friend_id");
    friend.value = "";
    return;
  }
  chatModal();
  showbuttoncall();
  navigator.getUserMedia(
    { video: true, audio: true },
    (stream) => {
      local_stream = stream;
      setLocalStream(local_stream);
      let call = peer.call(room, stream);
      call.on("stream", (stream) => {
        setRemoteStream(stream);
      });
      currentPeer = call;
    },
    (err) => {
      console.log(err);
    }
  );
}

peer.on("call", (call) => {
  var friend_id = document.getElementById("Friend_id");
  friend_id.value = call.peer;
  chatModal();
  showbuttoncall();
  navigator.getUserMedia(
    { video: true, audio: true },
    (stream) => {
      local_stream = stream;
      setLocalStream(local_stream);
      call.answer(local_stream);
      call.on("stream", (stream) => {
        setRemoteStream(stream);
      });
      currentPeer = call;
    },
    (err) => {
      console.log(err);
    }
  );
});

function send_chat() {
  let friend_id = document.getElementById("Friend_id").value;
  var conn = peer.connect(friend_id);
  conn.on("open", function () {
    var input = document.getElementById("input").value;
    conn.send(input);
    let li = document.createElement("li");
    li.innerHTML = input;
    messages.append(li);
    window.scrollTo(0, document.body.scrollHeight);

    send.value= "";
  });
}

peer.on('connection', function(conn) {
  conn.on('data', function(data){
    console.log(data);
    let li = document.createElement("li");
    li.innerHTML = data;
    messages.append(li);
    window.scrollTo(0, document.body.scrollHeight);
  });
});

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

//chat

// form.addEventListener("submit", function (e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit("chat message", input.value);
//     input.value = "";
//   }
// });
// socket.on("chat message", function (msg) {
//   var item = document.createElement("li");
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });

//  function createRoom() {
//    console.log("Creating Room");
//    let room = document.getElementById("room-input").value;
//    if (room == " " || room == "") {
//      alert("Vui long nhập ID room");
//      return;
//    }
//    room_id = room ;
//    peer = new Peer(room_id);
//    peer.on("open", (id) => {
//      console.log("Peer Connected with ID: ", id);
//      hideModal();
//      chatModal();
//      navigator.getUserMedia(
//        { video: true, audio: true },
//        (stream) => {
//          local_stream = stream;
//          setLocalStream(local_stream);
//        },
//        (err) => {
//          console.log(err);
//        }
//      );
//      notify("Waiting for peer to join.");
//    });
//    peer.on("call", (call) => {
//      call.answer(local_stream);
//      call.on("stream", (stream) => {
//        setRemoteStream(stream);
//      });
//      currentPeer = call;
//    });
//  }

function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}

function setRemoteStream(stream) {
  let video = document.getElementById("remote-video");
  video.srcObject = stream;
  video.play();
}
function showbuttoncall() {
  document.getElementById("call").hidden = true;
}
function hideModal() {
  document.getElementById("entry-modal").hidden = true;
}
function chatModal() {
  document.getElementById("chat").hidden = false;
}
function notify(msg) {
  let notification = document.getElementById("notification");
  notification.innerHTML = msg;
  notification.hidden = false;
  setTimeout(() => {
    notification.hidden = true;
  }, 3000);
}

// function joinRoom() {
//   console.log("Joining Room");
//   let room = document.getElementById("room-input-join").value;
//   if (room == " " || room == "") {
//     alert("Please enter room number");
//     return;
//   }
//   room_id = room;
//   hideModal();
//   chatModal();
//   peer = new Peer();
//   peer.on("open", (id) => {
//     console.log("Connected with Id: " + id);
//     navigator.getUserMedia(
//       { video: true, audio: true },
//       (stream) => {
//         local_stream = stream;
//         setLocalStream(local_stream);
//         notify("Joining peer");
//         let call = peer.call(room_id, stream);
//         call.on("stream", (stream) => {
//           setRemoteStream(stream);
//         });
//         currentPeer = call;
//       },
//       (err) => {
//         console.log(err);
//       }
//     );
//   });
// }

function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing();
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing();
    };
    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
      screenSharing = true;
    }
    console.log(screenStream);
  });
}

function stopScreenSharing() {
  if (!screenSharing) return;
  let videoTrack = local_stream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }
  screenStream.getTracks().forEach(function (track) {
    track.stop();
  });
  screenSharing = false;
}
