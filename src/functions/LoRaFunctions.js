import { logYellow } from "./logColors";
import projName from "./models/projName";
import msgLora from "../models/msgLora";
import { socketServer } from "../connections/socketServer";

export function sendToGateway(msg) {
  socketServer.emit('LoRamessage', msg);
}

export function sendConfirmation(macDestination, timestamp) {
  const str = myMAC + "!" + macDestination + "!" + "confirm" + "!" + timestamp + "!OK";
  return str;
}

export async function isFromAProject(str) {
  const projsNames = await projName.find({}, { "_id": 0, "id": 0, "__v": 0 });
  var res;
  projsNames.map((x) => {
    res = x.projName + res;
  })
  return res.includes(str);
}

export async function isDuplicate(msg) {
  const res = await msgLora.countDocuments({ message: msg });
  if (res >= 1) {
    logYellow("Mensagem Duplicada");
    return true;
  } else {
    return false;
  }
}