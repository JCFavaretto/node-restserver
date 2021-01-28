const express = require("express");
const fileUpload = require("express-fileupload");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No se subio ningun archivo",
      },
    });
  }

  // Valida tipo
  let tiposValidos = ["productos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Los tipos permitidos son: " + tiposValidos.join(", "),
        tipo,
      },
    });
  }

  // Extensiones permitidas
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];

  let extensionesValidas = ["png", "jpg", "gif", "jpeg", "svg"];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son: " + extensionesValidas.join(", "),
        extension,
      },
    });
  }
  // Cambiar nombre de los archivos
  let name = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads/${tipo}/${name}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (tipo === "usuarios") {
      imagenUsuario(id, res, name);
    } else {
      imagenProducto(id, res, name);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      borrarArchivo(nombreArchivo, "usuarios");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuario) {
      borrarArchivo(nombreArchivo, "usuarios");
      return res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe en la base de datos",
        },
      });
    }

    borrarArchivo(usuario.img, "usuarios");

    usuario.img = nombreArchivo;

    usuario.save((err, usuarioBD) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioBD,
        img: nombreArchivo,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, producto) => {
    if (err) {
      borrarArchivo(nombreArchivo, "productos");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!producto) {
      borrarArchivo(nombreArchivo, "productos");
      return res.status(400).json({
        ok: false,
        err: {
          message: "El producto no existe en la base de datos",
        },
      });
    }

    borrarArchivo(producto.img, "productos");

    producto.img = nombreArchivo;

    producto.save((err, productoBD) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        producto: productoBD,
        img: nombreArchivo,
      });
    });
  });
}

function borrarArchivo(nombre, tipo) {
  let pathUrl = path.resolve(__dirname, `../../uploads/${tipo}/${nombre}`);
  if (fs.existsSync(pathUrl)) {
    fs.unlinkSync(pathUrl);
  }
}

module.exports = app;
