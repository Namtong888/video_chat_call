// const mainleft = document.getElementById("main__left");
const checkbox = document.getElementById("show_chat");
const chat_i = document.getElementById("chat_i");

function show__chat() {
  checkbox.checked = true;
  chat_i.hidden = true;
}

function show__user() {
  checkbox.checked = false;
}
