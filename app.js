const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require('multer');
require("dotenv").config();
const MONGO_URL = process.env.DB_URI;
const PORT = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

require("./tu-proyecto/Schemas/userSchema");
require("./tu-proyecto/Schemas/BC_Uschema");
const User = mongoose.model("users");
const BC_U = mongoose.model("bc_u");

// Esta madre se Conecta a MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Conectado a MongoDB"), console.log("");

    const changeStream = User.watch();

    changeStream.on("change", async (change) => {
      if (change.operationType === "insert") {
        try {
          const newDoc = change.fullDocument;
          await BC_U.create(newDoc);
        } catch (error) {
          console.error("Error al respaldar documento:", error);
        }
      } else if (change.operationType === "delete") {
        try {
          const deletedId = change.documentKey._id;
          await BC_U.deleteOne({ _id: deletedId });
        } catch (error) {
          console.error("Error al eliminar documento de BC_U:", error);
        }
      }
    });
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB", err), console.log("");
  });

app.listen(PORT, () => {
  console.log(""), console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "tu-proyecto/public", "login.html"));
});

//Controladores de solicitudes
const userController = require("./tu-proyecto/Controllers/userController");
const user_imageController = require("./tu-proyecto/Controllers/user_imageController");
const changeController = require("./tu-proyecto/Controllers/changeController");
const BC_UController = require("./tu-proyecto/Controllers/BC_UController");

//Solicitudes a la base de datos para usuarios

app.post("/register", userController.registerUser);

app.post("/user-aval", userController.user_aval);

app.post("/login", userController.loginUser);

app.post("/userData", userController.userData);

app.put("/updateUser", userController.updateUser);

app.get("/get-All-User", userController.getAllUsers);

app.delete("/deleteUser", userController.deleteUser);

//Solicitudes a la base de datos para imagenes

app.put("/updateUser-Image", user_imageController.upload.single('image'), user_imageController.updateUserImages);

app.post("/userImage", user_imageController.userImage);

//Solicitudes a la base de datos para cmabios

app.post("/addChange", changeController.addChange);

app.post("/ChangeData", changeController.changeData);

app.get("/get-All-Changes", changeController.getAllChanges);

//Solicitudes a la base de datos para BC_U

app.get("/get-All-BC_U", BC_UController.getAllData);

app.get("/CompareDB", BC_UController.Compare);
