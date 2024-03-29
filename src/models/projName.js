import mongoose from "mongoose";
//Cria o modelo do checklist que se armazena no mongoDB
const projNameSchema = new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  projName: {
    type: String,
    required: true,
    unique: true
  },
}, { collection: 'projName' }
);

export const projName = mongoose.model("ProjName", projNameSchema);