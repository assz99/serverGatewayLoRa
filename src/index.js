const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');

require("./models/msgLora");
require("./models/msgProj");
require("./models/projName");

const MsgLora = mongoose.model("MsgLora");
const MsgProj = mongoose.model("MsgProj");
const ProjName = mongoose.model("ProjName");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 8001;
const dbUrl = "mongodb://localhost:27017/gatewayLora";

mongoose.connect(
  dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}
);


httpServer.listen(port, () => {
  console.log(`Projeto rodando em http://localhost:${port}`)
});

async function isFromAProject(str) {
  const projsNames = await ProjName.find({}, { "_id": 0, "id": 0, "__v": 0 });
  var res;
  projsNames.map((x) => {
    res = x.projName + res;
  })
  return res.includes(str);

}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('message', async function (message) {
    var objMsg = { message: message }
    await MsgLora.create(objMsg);
    const receivedString = message.split('!');
    if (isFromAProject(receivedString[2])) {
      objMsg = {
        sender: receivedString[0],
        projName:receivedString[2],
        timeStamp:receivedString[3],
        message:receivedString[4],
      }
      await MsgProj.create(objMsg);
    }
    socket.emit('message', "Recebido");
  });
});

isFromAProject("b8:27:eb:8e:94:f2!8C:80:40:EA:73:E0!arCond!1637488366304!603");
