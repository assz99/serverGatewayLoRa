const mongoose = require("mongoose");
//Cria o modelo do checklist que se armazena no mongoDB
const msgTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: Number,
  }
}, { collection: 'msgType' }
);

mongoose.model("MsgType", msgTypeSchema);