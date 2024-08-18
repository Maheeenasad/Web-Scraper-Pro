const mongoose = require("mongoose");

const ScrapedDataSchema = new mongoose.Schema({
  url: String,
  data: Object,
  interactions: [Object],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScrapedData", ScrapedDataSchema);
