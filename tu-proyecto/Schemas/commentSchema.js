const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  image: String,
  contentType: String,
});

const commentSchema = new Schema(
  {
    user_name: String,
    user_image: String,
    image: imageSchema,
    comment: String,
    date: { date: String, time: String },
    subdate: { type: Date, default: Date.now },
  },
  {
    collection: "comments",
  }
);

commentSchema.pre("save", function (next) {
  const dateMexico = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
  const [datePart, timePart] = dateMexico.split(", ");
  this.date = { date: datePart, time: timePart };
  next();
});

mongoose.model("comment", commentSchema);