import express from "express";
import bodyParser from 'body-parser'
import { socketServer } from "./connections/socketServer.js";
import { socketClient } from "./connections/socketClient.js";
import {
  sendToGateway,
  isFromAProject,
  sendConfirmation,
  isDuplicate
} from "./functions/LoRaFunctions.js";


import "./connections/mongoConnection.js"
import { getTimeStamp } from "./functions/getTimeStamp.js";

import { checkControl } from "./functions/controlFunctions.js";
import { msgProj } from "./models/msgProj.js";
import { msgLora } from "./models/msgLora.js";
import { logCyan, logBlue, logRed, logGreen, logYellow } from "./functions/logColors.js";

const app = express();

const port = 8001;

socketClient.on("connect", () => {
  console.log("Conectado no servidor");
  console.log(socketClient.id);
});


const myMAC = "b8:27:eb:8e:94:f2";
var sendTime = false;

app.listen(port, () => {
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
    insertOnControl(msg, timestamp);
    res.send('OK')
  } catch (err) {
    return res.status(400).json({ error: "Falha em enviar a mensagem." });
  }
})



socketClient.on("sendMessage", (res) => {
  try {
    const { remetente, projName, mensagem } = res;
    const timestamp = getTimeStamp();
    const msg = myMAC + '!' + remetente + '!' + projName + '!' + timestamp + '!' + mensagem;
    console.log("Enviando para o Gateway: " + msg);
    sendToGateway(msg);
    insertOnControl(msg, timestamp);
  } catch (err) {
    console.log(err);
  }
})

// msg = remetente + "!" + destino + "!" + projNome + "!" + pegarTimeStamp + "!" + msgSensores;
// msgConfirmation = remetente + "!" + destino + "!" + confirm+ "!"+ "TimeStamp" + !OK;

socketServer.on('connection', (socket) => {
  logCyan(`gateway: ${socket.id} conectado`);
  socket.on('message', async function (message) {
    logCyan(`Recebi a mensagem:\n ${message}`);
    if (await isDuplicate(message)) {
      return;
    }
    var objMsg = { message: message }
    await msgLora.create(objMsg);
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
    socket.emit('LoRamessage', msg);
    //CASO FOR DE UM PROJETO ARMAZENA A MENSAGEM NO BANCO DE DADOS
    if (isFromAProject(receivedString[2])) {
      if (receivedString[2] == "confirm") {
        retireFromControl(receivedString[3]);
        return;
      }
      objMsg = {
        sender: receivedString[0],
        projName: receivedString[2],
        timeStamp: receivedString[3],
        message: receivedString[4],
      }
      await msgProj.create(objMsg);
      //VERIFICA SE O TIMESTAMP DO CLIENTE ESTA CERTO CASO NAO ESTEJA ELE ENVIA UM NOVO
      sendTime = false;
      if (receivedString[3] - getTimeStamp() > 90 || receivedString[3] - getTimeStamp() < -90) {
        sendTime = true;
      }
    }
    if (sendTime === true) {
      logRed("TimeStamp desatualizando Enviando novo");
      const msg1 = myMAC + "!" + receivedString[0] + "!time!" + getTimeStamp() + "!OK";
      socket.emit('LoRamessage', msg1);
    }
    if (receivedString[2] == "arCond") {
      const formatedMessage = receivedString[4].split('?');
      const arcondObj = {
        "destinatario": receivedString[0],
        "mensagem": {
          "temperatura": formatedMessage[0],
          "humidade": formatedMessage[1],
          "irms": formatedMessage[2],
          "kwhTotal": formatedMessage[3],
        }
      }
      socketClient.emit("getMessage", arcondObj);
    }
  });
});

setInterval(checkControl, 20000);