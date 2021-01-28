const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de Google

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token).catch((e) => {
    return res.status(403).json({
      ok: false,
      err: e,
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, UsuarioBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (UsuarioBD) {
      if (!UsuarioBD.google) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Debe autentificarse con email y contraseña",
          },
        });
      } else {
        let token = jwt.sign(
          {
            usuario: UsuarioBD,
          },
          process.env.SEED,
          { expiresIn: process.env.CADUCIDAD_TOKEN }
        );
        return res.json({
          ok: true,
          usuario: UsuarioBD,
          token,
        });
      }
    } else {
      // Si es un nuevo usuario
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = googleUser.google;
      usuario.password = "XD";

      usuario.save((err, UsuarioBD) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        } else {
          let token = jwt.sign(
            {
              usuario: UsuarioBD,
            },
            process.env.SEED,
            { expiresIn: process.env.CADUCIDAD_TOKEN }
          );
          return res.json({
            ok: true,
            usuario: UsuarioBD,
            token,
          });
        }
      });
    }
  });
});

module.exports = app;
