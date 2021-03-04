/**
 * Main server app
 * This index.js file is responsible for all APIs and Socket connections
 */

//libraies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

//DB Models
const User = require("./models/User");
const Chat = require("./models/Chat");
const Broadcast = require("./models/Broadcast");

//Environment Variables
require("dotenv/config");

//Initialize the server
const port = process.env.PORT || 1337; //Default port
const app = express(); //Define the express app

//Enabling JSON parser
app.use(bodyParser.json());
app.use(cors());

const server = app.listen(port, function() {
  console.log('server running on port' + port);
});

const io = require('socket.io')(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

//DB Connection
mongoose.connect(
  "mongodb://connecton:lVADGwfwRHmx3PMshp9BxFOR9utQs7S9GHcVoKwouyxFqemhMeeRM3F9N69rVKaWDoDGBZi0a06iti3kjZ7i2g%3D%3D@connecton.mongo.cosmos.azure.com:10255/?ssl=true&appName=@connecton@&retrywrites=false",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

/**API Declaration */

//User login API
app.post("/login", (req, res) => {
  const query = User.find({ id: req.body.id });
  query
    .exec()
    .then((data) => {
      if (data.length === 0) {
        const user = new User({
          name: req.body.name,
          id: req.body.id,
          photo: req.body.photo,
          email: req.body.email,
        });

        user
          .save()
          .then((data) => {
            res.json(data);
          })
          .catch((error) => {
            res.json(error);
            console.log(error);
          });
        console.log("Data");
      } else {
        res.json(data[0]);
      }
    })
    .catch((error) => {
      res.json(error);
    });
});

//New chat message API
app.post("/chats", (req, res) => {
  const query = Chat.findOne({
    $or: [
      { receiver: req.body.receiver, sender: req.body.sender },
      { receiver: req.body.sender, sender: req.body.receiver },
    ],
  });
  query
    .exec()
    .then((data) => {
      const chat = new Chat({
        sender: req.body.sender,
        receiver: req.body.receiver,
        messages: req.body.messages,
      });
      console.log(req.body.messages);

      const querysenderset = User.updateOne(
        {
          id: req.body.sender,
        },
        {
          $push: {
            recentChat: {
              chatWith: req.body.receiver,
              sender: true,
              message: req.body.messages,
            },
          },
        }
      );

      const queryreceiverset = User.updateOne(
        {
          id: req.body.receiver,
        },
        {
          $push: {
            recentChat: {
              chatWith: req.body.sender,
              sender: false,
              message: req.body.messages,
            },
          },
        }
      );

      const querysenderupdate = User.updateOne(
        {
          id: req.body.sender,
          "recentChat.chatWith": req.body.receiver,
        },
        {
          $set: {
            recentChat: {
              chatWith: req.body.receiver,
              sender: true,
              message: req.body.messages,
            },
          },
        }
      );

      const queryreceiverupdate = User.updateOne(
        {
          id: req.body.receiver,
          "recentChat.chatWith": req.body.sender,
        },
        {
          $set: {
            recentChat: {
              chatWith: req.body.sender,
              sender: false,
              message: req.body.messages,
            },
          },
        }
      );
      if (data === null) {
        console.log("hey");
        Promise.all([
          chat.save(),
          querysenderset.exec(),
          queryreceiverset.exec(),
        ])
          .then((data) => {
            console.log("Hellop");
            res.json(data);
          })
          .catch((error) => {
            res.json(error);
          });
      } else {
        console.log("He")
        const updateChat = Chat.updateOne(
          {
            $or: [
              { receiver: req.body.receiver, sender: req.body.sender },
              { receiver: req.body.sender, sender: req.body.receiver },
            ],
          },
          { $push: { messages: req.body.messages } }
        );

        Promise.all([
          updateChat.exec(),
          querysenderupdate.exec(),
          queryreceiverupdate.exec(),
        ])
          .then((data) => {
            console.log("Hello1");
            res.json(data);
          })
          .catch((error) => {
            res.json(error);
          });

        // const query1 = User.find({ id: req.body.sender },
        //   { $push: { recentChat: { chatwith: req.body.receiver, message: req.body.messages} } }
        //   );
        //  query1
        //  .exec()
        //  .then(data => {
        //    res.json(data);
        //  })
        //  .catch(error => {
        //    res.json(error);
        //  });
      }
    })
    .catch((error) => {
      console.log(error)
      res.json(error);
    });
});

//Chat messages getter API
app.get("/chats/:sender/:receiver", (req, res) => {
  const chat = Chat.findOne({
    $or: [
      { receiver: req.params.receiver, sender: req.params.sender },
      { receiver: req.params.sender, sender: req.params.receiver },
    ],
  });

  chat.exec().then((data) => {
    if (data === null) {
      res.json([]);
    } else {
      res.json(data.messages);
    }
  });
});

//Chatrooms getter API
app.get("/chats/:userId", (req, res) => {
  const chat = Chat.find({
    $or: [{ receiver: req.params.userId }, { sender: req.params.userId }],
  });

  chat.exec().then((data) => {
    if (data.length === 0) {
      res.json([]);
    } else {
      res.json(data);
    }
  });
});

//New Broadcast Messages API
app.post("/broadcast", (req, res) => {
  const broadcast = new Broadcast(req.body);

  broadcast
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json(error);
    });
});

//Broadcast Message getter API
app.get("/broadcast", (req, res) => {
  const chat = Broadcast.find();

  chat.exec().then((data) => {
    if (data === null) {
      res.json(data);
    } else {
      res.json(data);
    }
  });
});

//All user
app.get("/find/all", (req, res) => {
  const user = User.find();
  user.exec().then((data) => {
    res.json(data);
    console.log(data);
  });
  // res.json("Hello");
});

//User finder API
app.get("/find/:id", (req, res) => {
  const user = User.find({ id: req.params.id });
  user.exec().then((data) => {
    res.json(data[0]);
  });
});

//Active users finder API
app.get("/users/active", (req, res) => {
  const users = User.find({ isActive: true });
  users.exec().then((data) => {
    res.json(data);
  });
});

//Inactive users finder API
app.get("/users/inactive", (req, res) => {
  const users = User.find({ isActive: false });
  users.exec().then((data) => {
    res.json(data);
  });
});

app.get("/serve", (req, res) => {
  res.json("Hello Connecton!");
});

/** Socket Declarations */

var clients = []; //connected clients

io.on("connection", (socket) => {
  console.log("New User Connected");
  socket.on("message", (data) => {
    console.log("Message Received at Backend " + data);
    socket.emit("message", data);
    console.log("Emitted message");
  });
  socket.on("storeClientInfo", function (data) {
    console.log(data.customId + " Connected");
    //store the new client
    var clientInfo = new Object();
    clientInfo.customId = data.customId;
    clientInfo.clientId = socket.id;
    clients.push(clientInfo);

    //update the active status
    const res = User.updateOne({ id: data.customId }, { isActive: true });
    res.exec().then(() => {
      console.log("Activated " + data.customId);

      //Notify others
      socket.broadcast.emit("update", "Updated");
      console.log("emmited");
    });
  });

  socket.on("disconnect", function (data) {
    for (var i = 0, len = clients.length; i < len; ++i) {
      var c = clients[i];

      if (c.clientId == socket.id) {
        //remove the client
        clients.splice(i, 1);
        console.log(c.customId + " Disconnected");

        //update the active status
        const res = User.updateOne({ id: c.customId }, { isActive: false });
        res.exec().then((data) => {
          console.log("Deactivated " + c.customId);

          //notify others
          socket.broadcast.emit("update", "Updated");
        });
        break;
      }
    }
  });
});

//Messages Socket
const chatSocket = io.of("/chatsocket");
chatSocket.on("connection", function (socket) {
  //On new message
  socket.on("newMessage", (data) => {
    //Notify the room
    socket.broadcast.emit("chat message", data);
  });
});


