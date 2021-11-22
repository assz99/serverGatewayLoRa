const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

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

const myMAC = "b8:27:eb:8e:94:f2";
const offset = -4;
httpServer.listen(port, () => {
  console.log(`Projeto rodando em http://localhost:${port}`)
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// msg = remetente + "!" + destino + "!" + projNome + "!" + pegarTimeStamp + "!" + msgSensores;
// msgConfirmation = remetente + "!" + destino + "!" + confirm+ "!"+ "TimeStamp";
async function isFromAProject(str) {
  const projsNames = await ProjName.find({}, { "_id": 0, "id": 0, "__v": 0 });
  var res;
  projsNames.map((x) => {
    res = x.projName + res;
  })
  return res.includes(str);

}

function sendConfirmation(x, y) {
  const str = myMAC + "!" + x + "!" + "confirm" + "!" + y;
  return str;
}

io.on('connection', (socket) => {
  console.log(`a user: ${socket.id} connected`);
  socket.on('message', async function (message) {
    var objMsg = { message: message }
    await MsgLora.create(objMsg);
    const receivedString = message.split('!');
    if (receivedString[1] !== myMAC) {
      console.log("Mensagem nao e para mim.");
      return;
    } else {
      console.log("Mensagem e para mim");
    }
    if (isFromAProject(receivedString[2])) {
      objMsg = {
        sender: receivedString[0],
        projName: receivedString[2],
        timeStamp: receivedString[3],
        message: receivedString[4],
      }
      await MsgProj.create(objMsg);
    }
    const msg = sendConfirmation(receivedString[0], receivedString[3])
    console.log(msg);
    socket.emit('message', msg);
  });
});

app.post("/enviar", (req, res) => {
  try {
    const { destino, projName, message } = req.body;
    const timestamp = new Date(new Date().getTime() + offset * 3600 * 1000).getTime();
    const msg = myMAC + "!" + destino + "!" + projName + "!" + timestamp + "!" + message;
    io.emit('message', msg);
    res.send('Mensagem Enviada');
  } catch(err){
    return res.status(400).json({ error: "Falha em enviar a mensagem." });
  }
});