const { getCommandObj } = require("../../utils/subCommandHandlers");

const name = "links";
const description = "KPH's online presence";

module.exports = getCommandObj(name, description);
