const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const { timeStamp } = require("console");

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
var control = [];
var sendTime = false;

httpServer.listen(port, () => {
  logGreen(`Projeto rodando em http://localhost:${port}`)
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/sendLoRa', (req, res) => {
  try {
    const { destiny, projName, message } = req.body;
    const timestamp = getTimeStamp();
    const msg = myMAC + '!' + destiny + '!' + projName + '!' + timestamp + '!' + message;
    console.log("Enviando para o Gateway: " + msg);
    sendToGateway(msg);
    //insertOnControl(msg, timestamp);
    res.send('OK')
  } catch (err) {
    return res.status(400).json({ error: "Falha em enviar a mensagem." });
  }
})

function getTimeStamp() {
  const timeStamp = Math.round(new Date(new Date().getTime() + offset * 3600 * 1000).getTime() / 1000);
  return timeStamp;
}

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
  logCyan(`a user: ${socket.id} connected`);
  socket.on('message', async function (message) {
    logCyan(`Recebi a mensagem:\n ${message}`);
    if (await isDuplicate(message)) {
      return;
    }
    var objMsg = { message: message }
    await MsgLora.create(objMsg);
    const receivedString = message.split('!');
    //VERIFICA SE A MENSAGEM REALMENTE E PARA O GATEWAY
    if (receivedString[1] === myMAC) {
      logGreen("Mensagem e para mim");
    } else {
      logYellow("Mensagem nao e para mim.");
      return;
    }
    //ENVIA A CONFIRMAÇÃO PARA O CLIENTE CONFIRMANDO QUE RECEBEU A MENSAGEM
    const msg = sendConfirmation(receivedString[0], receivedString[3]);
    logBlue("Enviando Confirmacao: " + msg);
    //socket.emit('LoRamessage', msg);
    //CASO FOR DE UM PROJETO ARMAZENA A MENSAGEM NO BANCO DE DADOS
    if (isFromAProject(receivedString[2])) {
      if (receivedString[2] === "confirm") {
        retireFromControl(receivedString[4]);
        return;
      }
      objMsg = {
        sender: receivedString[0],
        projName: receivedString[2],
        timeStamp: receivedString[3],
        message: receivedString[4],
      }
      await MsgProj.create(objMsg);
      //VERIFICA SE O TIMESTAMP DO CLIENTE ESTA CERTO CASO NAO ESTEJA ELE ENVIA UM NOVO
      sendTime = false;
      if (receivedString[3] - getTimeStamp() > 90 || receivedString[3] - getTimeStamp() < -90) {
        sendTime = true;
      }
    }
    if (sendTime === true) {
      logRed("TimeStamp desatualizando Enviando novo");
      const msg1 = myMAC + "!" + receivedString[0] + "!time!" + getTimeStamp();
      socket.emit('LoRamessage', msg1);
    }
  });
});

async function isDuplicate(msg) {
  const res = await MsgLora.countDocuments({ message: msg });
  if (res >= 1) {
    logYellow("Mensagem Duplicada");
    return true;
  } else {
    return false;
  }
}

function insertOnControl(msg, timestamp) {
  control.push({ message: msg, timestamp: timestamp });
  logYellow(`Colocando a mensagem no controle:\n${msg}`)
  if (control.length > 24) {
    logRed("Cuidado vetor controle esta com muita mensagem;")
  }
}

function checkControl() {
  logYellow("Verificando Vetor Control")
  control.map((x, index) => {
    const timestamp = new Date(new Date().getTime() + offset * 3600 * 1000).getTime();
    logRed(timestamp - x.timestamp);
    if (timestamp - x.timestamp >= 30000) {
      sendToGateway(x.message);
      control[index].timestamp = timestamp;
      logYellow("Reenviando mensagem pois nao foi confirmada.")
    }
  })
}

function retireFromControl(timestamp) {
  control.map((x, index) => {
    if (x.timeStamp === timestamp) {
      logGreen(`Retirando a mensagem: ${x.message} do controle.`)
      control.splice(index, 1);
    }
  })
}

function sendToGateway(msg) {
  io.emit('LoRamessage', msg);
}
/*APAGAR FUNÇÃO FUTURAMENTE
app.post("/enviar", (req, res) => {
  try {
    const { destino, projName, message } = req.body;
    console.log("destino:" + destino);
    const timestamp = new Date(new Date().getTime() + offset * 3600 * 1000).getTime();
    const msg = myMAC + "!" + destino + "!" + projName + "!" + timestamp + "!" + message;
    sendToGateway(msg);
    insertOnControl(msg, timestamp);
    res.send('Mensagem Enviada');
  } catch (err) {
    return res.status(400).json({ error: "Falha em enviar a mensagem." });
  }
})*/
function logCyan(msg) {
  console.log('\x1b[36m%s\x1b[0m', `${msg}`);
}
function logBlue(msg) {
  console.log('\x1b[34m%s\x1b[0m', `${msg}`);
}
function logRed(msg) {
  console.log('\x1b[31m%s\x1b[0m', `${msg}`);
}
function logGreen(msg) {
  console.log('\x1b[32m%s\x1b[0m', `${msg}`);
}
function logYellow(msg) {
  console.log('\x1b[33m%s\x1b[0m', `${msg}`);
}

//setInterval(checkControl, 20000);