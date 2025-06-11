const socket = io("http://localhost:8000");

let messageIdCounter = 0;
const name = prompt("Enter Your Name to Join the Chat:")?.trim();

if (!name) {
  alert("You must enter a name to join the chat!");
  location.reload();
} else {
  socket.emit("user-joined", name);
  document.getElementById("userStatus").innerText = `You (${name}) - Online`;
}

const firstDiv = document.querySelector(".first");

function generateMessage(username, message, side, status = "", messageId = "") {
  const container = document.createElement("div");
  container.classList.add("message-container");

  if (side === "right") {
    container.classList.add("align-end");
  } else if (side === "left") {
    container.classList.add("align-start");
  } else {
    container.classList.add("align-center");
  }

  if (side === "mid") {
    const midMsg = document.createElement("div");
    midMsg.classList.add("mid-para");
    midMsg.innerText = message;
    container.appendChild(midMsg);
  } else {
    const bubble = document.createElement("div");
    bubble.classList.add("msg-bubble", side === "right" ? "right-bubble" : "left-bubble");

    const header = document.createElement("div");
    header.classList.add("msg-header");
    header.innerText = username;

    const body = document.createElement("div");
    body.classList.add("msg-body");
    body.innerText = message;

    const time = document.createElement("div");
    time.classList.add("msg-time");

    const timeText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.innerText = `${timeText} ${status}`;

    // Assign messageId to status time for later update
    if (side === "right" && messageId) {
      container.dataset.msgId = messageId;
      time.id = `status-${messageId}`;
    }

    bubble.appendChild(header);
    bubble.appendChild(body);
    bubble.appendChild(time);
    container.appendChild(bubble);
  }

  firstDiv.appendChild(container);
  container.scrollIntoView({ behavior: "smooth" });
}

function sendMessage() {
  const msgInput = document.getElementById("message");
  const message = msgInput.value.trim();
  if (!message) return;

  msgInput.value = "";

  const messageId = `msg-${++messageIdCounter}`;
  socket.emit("send", { message, messageId });

  generateMessage("You", message, "right", "✓", messageId);
}

// Update tick to ✓✓ when message is delivered
socket.on("message-delivered", (messageId) => {
  const statusElement = document.getElementById(`status-${messageId}`);
  if (statusElement) {
    statusElement.innerText = statusElement.innerText.replace("✓", "✓✓");
  }
});

socket.on("new-user-joined", joinedName => {
  if (joinedName !== name) {
    generateMessage("", `${joinedName} joined the chat`, "mid");
  }
});

socket.on("receive", data => {
  generateMessage(data.name, data.message, "left");

  if (data.messageId) {
    socket.emit("delivered", data.messageId);
  }
});

socket.on("user-left", leftName => {
  generateMessage("", `${leftName} left the chat`, "mid");
});
