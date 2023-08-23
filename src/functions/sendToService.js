
import { socketClient } from "../connections/socketClient.js";
import { logYellow } from "./logColors.js";

export default function sendToService(destinatario, projCod, msg) {
  switch (projCod) {
    case "arCond":
      const formatedMessage = msg.split('?');
      const arcondObj = {
        "destinatario": destinatario,
        "mensagem": {
          "temperatura": formatedMessage[0],
          "humidade": formatedMessage[1],
          "irms": formatedMessage[2],
          "kwhTotal": formatedMessage[3],
        }
      }
      socketClient.emit("getMessage", arcondObj);
      break;

    default:
      logYellow("Codigod de Projeto não encontrado!!")

  }
}