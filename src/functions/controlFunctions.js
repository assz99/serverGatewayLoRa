import { logGreen, logRed, logYellow } from "./logColors";
import { sendToGateway } from "./LoRaFunctions";

var control = [];

export function insertOnControl(msg, timestamp) {
  control.push({ message: msg, timestamp: timestamp, timestampControl: timestamp });
  logYellow(`Colocando a mensagem no controle:\n${msg}`)
  if (control.length > 24) {
    logRed("Cuidado vetor controle esta com muita mensagem;")
  }
}

export function checkControl() {
  logYellow("Verificando Vetor Control")
  control.map((x, index) => {
    const timestamp = getTimeStamp();
    let control = timestamp - x.timestampControl;
    logRed(control);
    if (control >= 30) {
      sendToGateway(x.message);
      control[index].timestampControl = timestamp;
      logYellow("Reenviando mensagem pois nao foi confirmada.")
    }
  })
}

export function retireFromControl(timestamp) {
  control.map((x, index) => {
    if (x.timestamp == timestamp) {
      logGreen(`Retirando a mensagem: ${x.message} do controle.`)
      control.splice(index, 1);
    }
  })
}