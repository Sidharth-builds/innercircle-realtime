const socket = io();

let username = "";
let room = "";

const joinBtn = document.getElementById("joinBtn");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("username");
const roomSelect = document.getElementById("room");
const messageInput = document.getElementById("messageInput");

const messages = document.getElementById("messages");
const usersList = document.getElementById("users");
const typingIndicator = document.getElementById("typing");

const imageInput = document.getElementById("imageInput");

const imagePreviewModal = document.getElementById("imagePreviewModal");
const previewImage = document.getElementById("previewImage");
const sendImageBtn = document.getElementById("sendImageBtn");
const cancelImageBtn = document.getElementById("cancelImageBtn");

let selectedImage = null;

const userColors = {};

function getUserColor(name){

if(!userColors[name]){

const colors = [
"text-blue-400",
"text-green-400",
"text-purple-400",
"text-pink-400",
"text-yellow-400",
"text-teal-400"
];

const random = Math.floor(Math.random()*colors.length);

userColors[name] = colors[random];

}

return userColors[name];

}

window.onload = () => {
usernameInput.focus();
};

function joinRoom(){

username = usernameInput.value;
room = roomSelect.value;

if(username === "") return;

socket.emit("join", { username, room });

messageInput.focus();

}

joinBtn.onclick = joinRoom;

usernameInput.addEventListener("keypress",(e)=>{
if(e.key==="Enter"){
joinRoom();
}
});

function sendMessage(){

const msg = messageInput.value;

if(msg==="") return;

socket.emit("chat message",{
username,
message:msg,
room
});

messageInput.value="";

}

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keypress",(e)=>{
if(e.key==="Enter"){
sendMessage();
}
});

messageInput.addEventListener("input",()=>{

socket.emit("typing",{
username,
room
});

});

socket.on("typing",(data)=>{

if(data.username===username) return;

typingIndicator.textContent=`${data.username} is typing...`;

clearTimeout(window.typingTimeout);

window.typingTimeout=setTimeout(()=>{
typingIndicator.textContent="";
},1500);

});

socket.on("chat message",(data)=>{

const li=document.createElement("li");

const isMe=data.username===username;

li.className=isMe?"flex justify-end":"flex justify-start";

const wrapper=document.createElement("div");
wrapper.className="flex items-end gap-2";

const avatar=document.createElement("div");

avatar.className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold";

avatar.textContent=data.username[0].toUpperCase();

const bubble=document.createElement("div");

bubble.className=
(isMe?"bg-indigo-500 ml-auto":"bg-slate-700")
+" text-white px-4 py-2 rounded-2xl max-w-[60%] shadow";

const time=new Date().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

const colorClass=getUserColor(data.username);

bubble.innerHTML=`
<div class="text-xs">
<span class="${colorClass} font-semibold">${data.username}</span>
<span class="opacity-60 ml-2">${time}</span>
</div>
<div>${data.message}</div>
`;

if(!isMe){
wrapper.appendChild(avatar);
}

wrapper.appendChild(bubble);

li.appendChild(wrapper);

messages.appendChild(li);

messages.scrollTop=messages.scrollHeight;

});

imageInput.addEventListener("change",()=>{

const file=imageInput.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(){

selectedImage=reader.result;

previewImage.src=selectedImage;

imagePreviewModal.classList.remove("hidden");
imagePreviewModal.classList.add("flex");

};

reader.readAsDataURL(file);

});

sendImageBtn.onclick=()=>{

if(!selectedImage) return;

socket.emit("chat image",{
username,
room,
image:selectedImage
});

imagePreviewModal.classList.add("hidden");

selectedImage=null;

};

cancelImageBtn.onclick=()=>{

imagePreviewModal.classList.add("hidden");

selectedImage=null;

};

socket.on("chat image",(data)=>{

const li=document.createElement("li");

const isMe=data.username===username;

li.className=isMe?"flex justify-end":"flex justify-start";

const bubble=document.createElement("div");

bubble.className=
(isMe?"bg-indigo-500 ml-auto":"bg-slate-700")
+" text-white p-3 rounded-2xl max-w-[300px] shadow";

bubble.innerHTML=`
<div class="text-xs mb-1">
${data.username}
</div>
<img src="${data.image}" class="rounded-lg max-h-60"/>
`;

li.appendChild(bubble);

messages.appendChild(li);

messages.scrollTop=messages.scrollHeight;

});

socket.on("user list",(users)=>{

usersList.innerHTML="";

users.forEach(user=>{

const li=document.createElement("li");

li.className="bg-slate-700 px-3 py-2 rounded-lg text-sm";

li.textContent=user.username;

usersList.appendChild(li);

});

});