const mongoose = require('mongoose');
const dbUrl = "mongodb://127.0.0.1:27017/gatewayLora?directConnection=true";

mongoose.connect(
  dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}
);