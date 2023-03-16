import { io } from "socket.io-client";

export const socketClient = io('https://gestao-ar-adonisjs.herokuapp.com/', {
  auth: {
    token: '6XpwoKN0d/vrkdAWaqQw19J/s65eLSzY/kFPhTiRvVE='
  }
})