const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

require("./../Schemas/userSchema");
require("../Schemas/BC_Uschema");
require("../Schemas/user_imageSchema");
const User = mongoose.model("users");
const BC_U = mongoose.model("bc_u");
const userImage = mongoose.model("user_image");

const registerUser = async (req, res) => {
  const { user_name, password, email } = req.body;
  try {
    const enPassword = await bcrypt.hash(password, 12);
    const oldEmail = await User.findOne({ email: email });

    if (oldEmail) {
      res.send({
        status: "correo",
        data: "El correo ya está registrado!",
      });
    } else {
      await User.create({
        user_name: user_name,
        email: email,
        pass: enPassword,
      });
      await userImage.create({
        user_name: user_name,
        image: "",
        bgimage: "",
      });

      res.send({ status: "ok", data: "Usuario creado" });
    }
  } catch (error) {
    console.error("error: " + error);
    res.send({ status: "error", data: error });
  }
};

const user_aval = async (req, res) => {
  const { user_name } = req.body;
  try {
    const newName = await User.findOne({ user_name: user_name });
    if (newName) {
      res.send({
        status: "Ocupado",
        data: "Usuario Ocupado!",
      });
    } else {
      res.send({
        status: "Dispnible",
        data: "Usuario Disponible!",
      });
    }
  } catch (e) {
    console.error("Error al validar usuario: " + e);
  }
};

const loginUser = async (req, res) => {
  const { user, password } = req.body;

  const Email = await User.findOne({ email: user });
  const User_Name = await User.findOne({ user_name: user });

  if (!Email && !User_Name) {
    return res.status(404).send({ data: "Usuario no registrado" });
  }

  if (User_Name) {
    if (await bcrypt.compare(password, User_Name.pass)) {
      if (res.status(201)) {
        return res.send({
          status: "ok",
          usuario: User_Name.user_name,
        });
      } else {
        return res.send({ error: "error" });
      }
    } else {
      return res.send({
        status: "wrong password",
        data: "Contraseña incorrecta",
      });
    }
  } else {
    if (await bcrypt.compare(password, Email.pass)) {
      if (res.status(201)) {
        return res.send({
          status: "ok",
          user: Email.user_name,
        });
      } else {
        return res.send({ error: "error" });
      }
    } else {
      return res.send({
        status: "wrong password",
        data: "Contraseña incorrecta",
      });
    }
  }
};

const userData = async (req, res) => {
  const { user_name } = req.body;

  try {
    User.findOne({ user_name: user_name })
      .then((data) => {
        return res.send({ status: "ok", data: data });
      })
      .catch((err) => {
        // Manejo de errores si la promesa falla
        console.error("Error de búsqueda:", err);
        return res.status(500).send({ error: "Error interno del servidor" });
      });
  } catch (error) {
    console.error("Error we: ", error);
    return res.send({ error: error });
  }
};

const updateUser = async (req, res) => {
  const { image, user_name, email, password, newPassword } = req.body;
  try {
    if (!password) {
      await BC_U.updateOne(
        { user_name: user_name },
        {
          $set: {
            email,
          },
        }
      );
      await User.updateOne(
        { user_name: user_name },
        {
          $set: {
            email,
          },
        }
      );
    } else {
      const enPassword = await bcrypt.hash(newPassword, 12);

      const User_Name = await User.findOne({ user_name: user_name });
      if (await bcrypt.compare(password, User_Name.pass)) {
        await BC_U.updateOne(
          { user_name: user_name },
          {
            $set: {
              email,
              pass: enPassword,
            },
          }
        );
        await User.updateOne(
          { user_name: user_name },
          {
            $set: {
              email,
              pass: enPassword,
            },
          }
        );
      } else {
        res.send({ status: "error", data: "La contraseña actual no coincide" });
      }
    }
    res.send({ status: "ok", data: "Updated" });
  } catch (error) {
    return res.send({ error: error });
  }
};

const getAllUsers = async (req, res) => {
  let skip = parseInt(req.query.skip) || 0;

  try {
    const data = await User.find({}).skip(parseInt(skip)).limit(parseInt(10));

    const totalDocs = await User.countDocuments();
    const pages = {
      docs: data.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / 10),
    };

    res.send({ status: "200", data: data, pages: pages });
  } catch (error) {
    return res.send({ error: error });
  }
};

const deleteUser = async (req, res) => {
  const { user_name } = req.body;
  try {
    await userImage.deleteOne({ user_name: user_name });
    await User.deleteOne({ user_name: user_name });

    res.send({ status: "ok", data: "User Deleted" });
  } catch (error) {
    console.error("No se borro el usuarioo");
    return res.send({ error: error });
  }
};

module.exports = {
  registerUser,
  user_aval,
  loginUser,
  userData,
  updateUser,
  getAllUsers,
  deleteUser,
};
