const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

const app = express();

app.post("/login", function (req, res) {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, UsuarioBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!UsuarioBD) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario y/o Contraseña incorrectos",
        },
      });
    }

    if (!bcrypt.compareSync(body.password, UsuarioBD.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario y/o Contraseña incorrectos",
        },
      });
    }

    let token = jwt.sign(
      {
        usuario: UsuarioBD,
      },
      process.env.SEED,
      { expiresIn: process.env.CADUCIDAD_TOKEN }
    );

    res.json({
      ok: true,
      usuario: UsuarioBD,
      token,
    });
  });
});

module.exports = app;
