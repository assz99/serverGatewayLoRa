import mongoose from "mongoose";
const dbUrl = "mongodb://192.168.117.245:27017/gatewayLora?directConnection=true";

mongoose.connect(
  dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}
).then(() => {
         console.log('Banco conectado com sucesso')
       });