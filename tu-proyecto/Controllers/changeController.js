const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

require("./../Schemas/changeSchema");
const Change = mongoose.model("changes");


const addChange = async (req, res) => {
  const { user_name, user, type, description, personal } = req.body;

  try {

      await Change.create({
        by: user_name,
        edit: user,
        type: type,
        description: description,
        personalized: personal,
      });

      res.send({ status: "ok", data: "Cambio añadido" });
  } catch (error) {
    console.log("error: " + error);
    res.send({ status: "error", data: error });
  }
};

const getAllChanges = async (req, res) => {
  let skip = parseInt(req.query.skip) || 0;

  try {
    const data = await Change.find({})
    .skip(parseInt(skip))
    .limit(parseInt(10));

    const totalDocs = await Change.countDocuments();
    const pages = {
      docs: data.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / 10),
    }

    res.send({ status: "200", data: data, pages: pages });
  } catch (error) {
    return res.send({ error: error });
  }
};

const changeData = async (req, res) => {
  const { user_name } = req.body;

  try {
    Change.findOne({ by: user_name }).then((data) => {
      return res.send({ status: "ok", data: data });
    }).catch(err => {
        console.error('Error de búsqueda:', err);
        return res.status(500).send({ error: 'Error interno del servidor' });
      });
  } catch (error) {
    console.log("Error we: ", error);
    return res.send({ error: error });
  }
};

module.exports = {
  addChange,
  changeData,
  getAllChanges,
};