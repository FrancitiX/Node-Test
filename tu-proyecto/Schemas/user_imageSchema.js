const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userImageSchema = new Schema(
  {
    user_name: { type: String, unique: true },
    image: String,
    bgimage: { type: String, default: "0"},
    date: { date: String, time: String },
  },
  {
    collection: "user_image",
  }
);

userImageSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("user_image", userImageSchema);
