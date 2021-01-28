const express = require("express");
const _ = require("underscore");
let { verificarToken } = require("../middlewares/authentication");
const categoria = require("../models/categoria");

let app = express();

let Producto = require("../models/producto");

app.get("/producto", verificarToken, (req, res) => {
  // Obtener todos los productos
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 10;
  limite = Number(limite);

  // paginado
  Producto.find({ disponible: true })
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .skip(desde)
    .limit(limite)
    .exec((err, productos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Producto.countDocuments({ disponible: true }, (err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          conteo,
          productos,
        });
      });
    });
});

app.get("/producto/:id", verificarToken, (req, res) => {
  // Obtener producto por id
  let id = req.params.id;

  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, producto) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      if (!producto) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No se encontro el producto",
          },
        });
      }

      res.json({
        ok: true,
        producto,
      });
    });
});

app.get("/producto/buscar/:termino", verificarToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i");

  Producto.find({ disponible: true, nombre: regex })
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Producto.countDocuments(
        { disponible: true, nombre: regex },
        (err, conteo) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }

          res.json({
            ok: true,
            conteo,
            productos,
          });
        }
      );
    });
});

app.post("/producto", verificarToken, (req, res) => {
  // Crear nuevo producto
  let body = req.body;

  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    categoria: body.categoria,
  });

  producto.save((err, productoBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoBD) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No se a podido crear el producto",
        },
      });
    }

    res.json({
      ok: true,
      producto: productoBD,
    });
  });
});

app.put("/producto/:id", verificarToken, (req, res) => {
  // Actualizar producto
  let id = req.params.id;
  let body = _.pick(req.body, [
    "nombre",
    "precioUni",
    "disponible",
    "descripcion",
    "categoria",
  ]);
  let usuario = req.usuario._id;

  Producto.findByIdAndUpdate(
    id,
    { ...body, usuario },
    { new: true, runValidators: true },
    (err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!producto) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "El ID no existe",
          },
        });
      }
      res.json({
        ok: true,
        producto,
      });
    }
  );
});

app.delete("/producto/:id", verificarToken, (req, res) => {
  // Cambiar disponibilidad del producto
  let id = req.params.id;
  let disponible = false;
  let usuario = req.usuario._id;

  Producto.findByIdAndUpdate(
    id,
    { disponible, usuario },
    { new: true, runValidators: true },
    (err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!producto) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "El ID no existe",
          },
        });
      }
      res.json({
        ok: true,
        producto,
      });
    }
  );
});

module.exports = app;
