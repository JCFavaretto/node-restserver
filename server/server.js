require("./config/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = 3000;

app.get("/usuario", function (req, res) {
  res.json("get Usuario");
});

app.post("/usuario", function (req, res) {
  let body = req.body;

  if (body.nombre === undefined) {
    res.status(400).json({
      ok: false,
      message: "A name is required",
    });
  } else {
    res.json({
      usuario: body,
    });
  }
});

app.put("/usuario/:id", function (req, res) {
  let id = req.params.id;

  res.json({
    id,
  });
});

app.delete("/usuario", function (req, res) {
  res.json("delete Usuario");
});

app.listen(process.env.PORT, () => {
  console.log("Escuchando el puerto", process.env.PORT);
});
