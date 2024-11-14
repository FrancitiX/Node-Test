const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const changeSchema = new Schema(
  {
    by: String,
    edit: String,
    type: String,
    description: String,
    personalized: String,
    date: { date: String, time: String },
    subDate: { type: Date, default: Date.now}
  },
  {
    collection: "changes",
  }
);

changeSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("changes", changeSchema);
