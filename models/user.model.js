const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true },
    failCount: { type: Number, required: true },
    cfHandle: { type: String, required: false },
    batch: { type: Number, required: false },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = new mongoose.model("User", userSchema);
