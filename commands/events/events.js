const { getCommandObj } = require("../../utils/subCommandHandlers");

const name = "events";
const description = "Commands related to events";

module.exports = getCommandObj(name, description);
