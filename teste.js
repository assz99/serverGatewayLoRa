const { io } = require("socket.io-client");
const port = 8001;

const socketClient = io('https://gestao-ar-adonisjs.herokuapp.com/', {
  auth: {
    token: '5QIVKa7v1zOXwvXvHlkLA/SZFUrYNu6pc/Fzdd5l7ZA='
  }
})

socketClient.on("connect", () => {
  console.log("Conectado no servidor");
  console.log(socketClient.id);
});



enviarSocket = () => {
  const arcondObj = {
    "destinatario": "a4-4e-31-14-df-54",
    "mensagem": {
      "temperatura": 99,
      "humidade": 0,
      "irms": 30,
      "kwhTotal": 10000,
    }
  }

  console.log("Enviando");
  socketClient.emit("getMessage", arcondObj);
}

setTimeout(enviarSocket, 10000)