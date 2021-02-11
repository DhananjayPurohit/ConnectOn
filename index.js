/**
 * Main server app
 * This index.js file is responsible for all APIs and Socket connections
 */

//libraies
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');

//DB Models
const User = require("./models/User");
const Chat = require("./models/Chat");
const Broadcast = require("./models/Broadcast");

//Environment Variables
require("dotenv/config");

//Initialize the server
const port = process.env.PORT || 1337; //Default port
const app = express(); //Define the express app
const server = http.createServer(app); //Create server with express
const io = socketIo(server); //Initialize Socket

//Enabling JSON parser
app.use(bodyParser.json());
app.use(cors());

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
    .then(data => {
      if (data.length === 0) {
        const user = new User({
          name: req.body.name,
          id: req.body.id,
          photo: req.body.photo,
          email: req.body.email
        });

        user
          .save()
          .then(data => {
            res.json(data);
          })
          .catch(error => {
            res.json(error);
            console.log(error)
          });
          console.log("Data")
      } else {
        res.json(data[0]);
      }
    })
    .catch(error => {
      res.json(error);
    });
});

//New chat message API
app.post("/chats", (req, res) => {
  
  const query = Chat.findOne({
    $or: [
      { reciever: req.body.reciever, sender: req.body.sender },
      { reciever: req.body.sender, sender: req.body.reciever }
    ]
  });
  query
    .exec()
    .then(data => {

      const chat = new Chat({
        sender: req.body.sender,
        reciever: req.body.reciever,
        messages: req.body.messages
      });

      const query1 = User.find({ id: req.body.sender },
        { $push: { recentChat: { chatwith: req.body.reciever, message: req.body.messages} } }
        );

      if (data === null) {
        Promise.all([
          chat.save(),
          query1.exec()
      ]).then(data => {
        console.log("Hello");
        res.json(data);
      })
      .catch(error => {
        res.json(error);
      });

      } else {
        const updateChat = Chat.updateOne(
          {
            $or: [
              { reciever: req.body.reciever, sender: req.body.sender },
              { reciever: req.body.sender, sender: req.body.reciever }
            ]
          },
          { $push: { messages: req.body.messages } }
        );

        const query1 = User.find({ id: req.body.sender },
          { $push: { recentChat: { chatwith: req.body.reciever, message: req.body.messages} } }
          );
          Promise.all([
            updateChat.exec(),
            query1.exec()
        ]).then(data => {
        console.log("Hello1");
            res.json(data);
          })
          .catch(error => {
            res.json(error);
          });
          
          // const query1 = User.find({ id: req.body.sender },
          //   { $push: { recentChat: { chatwith: req.body.reciever, message: req.body.messages} } }
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
    .catch(error => {
      res.json(error);
    });
});

//Chat messages getter API
app.get("/chats/:sender/:reciever", (req, res) => {
  const chat = Chat.findOne({
    $or: [
      { reciever: req.params.reciever, sender: req.params.sender },
      { reciever: req.params.sender, sender: req.params.reciever }
    ]
  });

  chat.exec().then(data => {
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
    $or: [{ reciever: req.params.userId }, { sender: req.params.userId }]
  });

  chat.exec().then(data => {
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
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

//Broadcast Message getter API
app.get("/broadcast", (req, res) => {
  const chat = Broadcast.find();

  chat.exec().then(data => {
    if (data === null) {
      res.json(data);
    } else {
      res.json(data);
    }
  });
});

//All user
app.get("/find/all", (req,res) => {
  const user = User.find();
  user.exec().then(data => {
    res.json(data);
    console.log(data)
  });
  // res.json("Hello");
});

//User finder API
app.get("/find/:id", (req, res) => {
  const user = User.find({ id: req.params.id });
  user.exec().then(data => {
    res.json(data[0]);
  });
});

//Active users finder API
app.get("/users/active", (req, res) => {
  const users = User.find({ isActive: true });
  users.exec().then(data => {
    res.json(data);
  });
});

//Inactive users finder API
app.get("/users/inactive", (req, res) => {
  const users = User.find({ isActive: false });
  users.exec().then(data => {
    res.json(data);
  });
});

app.get("/serve", (req, res) => {
  res.json("Hello Connecton!");
})

/** Socket Declarations */

var clients = []; //connected clients

io.on("connection", socket => {
  console.log("New User Connected");
  socket.on("message", data => {
    console.log("Message Received at Backend "+ data)
    socket.emit("message", data);
    console.log("Emitted message");
  })
  socket.on("storeClientInfo", function(data) {
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

  socket.on("disconnect", function(data) {
    for (var i = 0, len = clients.length; i < len; ++i) {
      var c = clients[i];

      if (c.clientId == socket.id) {
        //remove the client
        clients.splice(i, 1);
        console.log(c.customId + " Disconnected");

        //update the active status
        const res = User.updateOne({ id: c.customId }, { isActive: false });
        res.exec().then(data => {
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
chatSocket.on("connection", function(socket) {
  //On new message
  socket.on("newMessage", data => {
    //Notify the room
    socket.broadcast.emit("chat message", data);
  });
});

//Let the server to listen
server.listen(port, () => console.log(`Listening on port ${port}`));
