const { getCommandObj } = require("../../utils/subCommandHandlers");

const name = "events";
const description = "Commands related to events";
const isParent = true;

module.exports = getCommandObj(name, description, isParent);
