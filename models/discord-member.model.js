const mongoose = require("mongoose");

const discordMemberSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Discord User ID
    failCount: { type: Number, required: true },
    isMember: { type: Boolean, required: true },
    cfHandle: { type: String, required: false },
    batch: { type: Number, required: false },
  },
  {
    timestamps: true,
    collection: "discord-members",
  }
);

module.exports = new mongoose.model("DiscordMember", discordMemberSchema);
