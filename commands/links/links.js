const { getCommandObj } = require("../../utils/subCommandHandlers");

const name = "links";
const description = "KPH's online presence";
const isParent = true;

module.exports = getCommandObj(name, description, isParent);
