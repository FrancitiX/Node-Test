const { compare } = require("bcrypt");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

require("./../Schemas/userSchema");
require("../Schemas/BC_Uschema");
const User = mongoose.model("users");
const BC_U = mongoose.model("bc_u");


const getAllData = async (req, res) => {
  
    try {
      const data = await BC_U.find({})
      res.send({ status: "200", data: data });
    } catch (error) {
      return res.send({ error: error });
    }
  };

  const Compare = async (req, res) => {
    try {
      // Obtener todos los registros de ambas colecciones
      const users = await User.find().lean(); // lean() para obtener objetos planos
      const bcUsers = await BC_U.find().lean();
  
      // Crear mapas o conjuntos para comparación rápida
      const userMap = new Map(users.map(user => [user.user_name, user]));
      const bcUserMap = new Map(bcUsers.map(user => [user.user_name, user]));
  
      // Comparar los dos conjuntos de datos
      const discrepancies = [];
      // for (const [key, user] of userMap.entries()) {
      //   const bcUser = bcUserMap.get(key);
      //   if (!bcUser || JSON.stringify(user) !== JSON.stringify(bcUser)) {
      //     discrepancies.push({ user, bcUser });
      //   }
      // }
      for (const [key, user] of userMap.entries()) {
        const bcUser = bcUserMap.get(key);
        if (!bcUser || 
            user.user_name !== bcUser.user_name || 
            user.email !== bcUser.email || 
            user.pass !== bcUser.pass) {
          discrepancies.push({ user, bcUser });
        }
      }

      if (discrepancies.length > 0) {
        console.log("Discrepancias encontradas:", discrepancies);
        return res.send({status: "error", data: "Problema en la base de datos"});
      } else {
        return res.send({status: "ok", data: "Todo bien en la base de datos"});
      }
    } catch (error) {
      console.error("Error comparando tablas:", error);
    }
  }

  module.exports = {
    getAllData,
    Compare
  };