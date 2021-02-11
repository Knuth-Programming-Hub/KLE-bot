const mongoose = require("mongoose");

const prefixSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Discord Guild ID
    prefix: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "prefixes",
  }
);

module.exports = new mongoose.model("Prefix", prefixSchema);
