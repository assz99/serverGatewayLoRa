const mongoose = require("mongoose");
//Cria o modelo do checklist que se armazena no mongoDB
const msgProjSchema = new mongoose.Schema({
  sender: {
    type: String,
    require: true
  },
  projName: {
    type: String,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { collection: 'msgProj' }
);

module.exports = mongoose.model("MsgProj", msgProjSchema);