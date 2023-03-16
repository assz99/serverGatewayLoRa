import mongoose from "mongoose";
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

export const msgProj = mongoose.model("MsgProj", msgProjSchema);