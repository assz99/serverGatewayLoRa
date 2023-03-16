import mongoose from "mongoose";
//Cria o modelo do checklist que se armazena no mongoDB
const msgLoraSchema = new mongoose.Schema({
  message: {
    type: String,
    require: true
  }
}, { collection: 'msgLora' }
);

export const msgLora = mongoose.model("MsgLora", msgLoraSchema);