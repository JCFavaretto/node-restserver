require("./config/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = 3000;

app.use(require("./routes/usuario"));

mongoose.connect(
  process.env.URLDB,
  {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
  }
);

app.listen(process.env.PORT, () => {
  console.log("Escuchando el puerto", process.env.PORT);
});
