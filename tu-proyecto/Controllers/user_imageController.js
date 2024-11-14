const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());

require("../Schemas/user_imageSchema");
const User_Image = mongoose.model("user_image");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const updateUserImages = async (req, res) => {
  const { user_name, bgimage } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const updatedUserImage = await User_Image.findOneAndUpdate(
      { user_name: user_name },
      {
        $set: {
          image: image,
          bgimage: bgimage,
        },
      },
      { new: true }
    );

    if (!updatedUserImage) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    return res.status(201).send({ status: "ok" });
  } catch (error) {
    console.error("Error al actualizar la imagen del usuario:", error);
    return res.send({ error: error, data: error });
  }
};


const userImage = async (req, res) => {
  const { user_name } = req.body;
  
  try {
    User_Image.findOne({ user_name: user_name }).then((data) => {
      fs.access(data.image, fs.constants.F_OK, (err) => {
        if (err) {
          // console.error('La imagen no existe o no se puede acceder:', data.image);
          return res.send({ status: "404", data: data });
        } else {
          return res.send({ status: "ok", data: data });
        }
      });
    }).catch(e => {
        console.error('Error de búsqueda:', e );
        return res.status(500).send({ error: 'Error interno del servidor' });
      });
  } catch (error) {
    console.log("Error we: ", error);
    return res.send({ error: error });
  }
};

module.exports = {
  updateUserImages,
  upload,
  userImage,
};