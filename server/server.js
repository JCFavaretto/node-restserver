require("./config/config");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, "../public")));

// Configuracion global de rutas
app.use(require("./routes/index"));

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
