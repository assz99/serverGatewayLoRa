const mongoose = require("mongoose");
//Cria o modelo do checklist que se armazena no mongoDB
const msgLoraSchema = new mongoose.Schema({
  message: {
    type: String,
    require: true
  }
}, { collection: 'msgLora' }
);

module.exports = mongoose.model("MsgLora", msgLoraSchema);