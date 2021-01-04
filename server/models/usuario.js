const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

let rolesValidos = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un rol valido ",
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "Ingrese el nombre"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Ingrese el mail"],
  },
  password: {
    type: String,
    required: [true, "Ingrese la contraseña"],
  },
  img: {
    type: String,
  },
  role: {
    type: String,
    default: "USER_ROLE",
    enum: rolesValidos,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  google: {
    type: Boolean,
    default: false,
  },
});

usuarioSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: "Ese {PATH} ya existe." });

module.exports = mongoose.model("Usuario", usuarioSchema);
