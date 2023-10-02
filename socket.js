const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

let users = [];
const addUser = (userId, socketId, userInfo) => {
  const checkUser = users.some((u) => u.userId === userId);
  if (!checkUser) {
    users.push({ userId, socketId, userInfo });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const findUser = (id) => {
  return users.find((u) => u.userId === id);
};

io.on("connection", (socket) => {
  console.log("user is connecting...");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", (data) => {
    const user = findUser(data.receiverId);

    if (user !== undefined) {
      socket.to(user.socketId).emit("getMessage", data);
    }
  });

  socket.on("messageSeen", (data) => {
    const user = findUser(data.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("messageResponse", data);
    }
  });

  socket.on("typingMessage", (data) => {
    const user = findUser(data.receiverId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("getTypingMessage", {
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user is disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
