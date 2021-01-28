const express = require("express");
let {
  verificarToken,
  verificaAdmin_Role,
} = require("../middlewares/authentication");
const categoria = require("../models/categoria");

let app = express();

let Categoria = require("../models/categoria");

app.get("/categoria", verificarToken, (req, res) => {
  // Mostrar todas las categorias
  Categoria.find()
    .sort("descripcion")
    .populate("usuario", "nombre email ")
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Categoria.countDocuments((err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          conteo,
          categorias,
        });
      });
    });
});

app.get("/categoria/:id", verificarToken, (req, res) => {
  // Mostrar una categoria por ID
  let id = req.params.id;

  Categoria.findById(id)
    .populate("usuario", "nombre email ")
    .exec((err, categoria) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      if (!categoria) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No se encontro la categoria",
          },
        });
      }

      res.json({
        ok: true,
        categoria,
      });
    });
});

app.post("/categoria", verificarToken, (req, res) => {
  // Crear nueva categoria
  let categoria = new Categoria({
    descripcion: req.body.descripcion,
    usuario: req.usuario._id,
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No se a podido crear la categoria",
        },
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB,
    });
  });
});

app.put("/categoria/:id", verificarToken, (req, res) => {
  // Actualizar categoria

  let id = req.params.id;
  let descripcion = req.body.descripcion;
  let usuario = req.usuario._id;

  Categoria.findByIdAndUpdate(
    id,
    { descripcion, usuario },
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No se a podido actualizar la categoria",
          },
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    }
  );
});

app.delete(
  "/categoria/:id",
  [verificarToken, verificaAdmin_Role],
  (req, res) => {
    // Eliminar categoria
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrada) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!categoriaBorrada) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Categoria no encontrada",
          },
        });
      }
      res.json({
        ok: true,
        categoria: categoriaBorrada,
      });
    });
  }
);

module.exports = app;
