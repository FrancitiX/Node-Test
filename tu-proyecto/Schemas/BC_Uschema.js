const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bc_uSchema = new Schema(
  {
    user_name: { type: String, unique: true },
    email: { type: String, unique: true },
    pass: String,
    date: { date: String, time: String },
  },
  {
    collection: "BC_U",
  }
);

bc_uSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("bc_u", bc_uSchema);
