const { getCommandObj } = require("../../utils/subCommandHandlers");

const name = "cfgroup";
const description = "Commands related to Codeforces group";
const isParent = true;

module.exports = getCommandObj(name, description, isParent);
