const mongo = require("../mongo");
const User = require("../models/user.model");

const add = async (discordUserId) => {
  await mongo().then(async (mongoose) => {
    try {
      const newUser = new User({
        discordId: discordUserId,
        failCount: 0,
      });

      await newUser.save();
    } finally {
      mongoose.connection.close();
    }
  });
};

// I am using two DB calls here as I was unable to get the desired result with $inc
const updateFailCount = async (discordUserId) => {
  let count = null;
  await mongo().then(async (mongoose) => {
    try {
      await User.findOne({ discordId: discordUserId }, (err, doc) => {
        if (doc !== null) {
          count = doc.failCount + 1;
        }
      });
    } finally {
      mongoose.connection.close();
    }
  });
  await mongo().then(async (mongoose) => {
    try {
      await User.findOneAndUpdate(
        { discordId: discordUserId },
        { failCount: count }
      );
    } finally {
      mongoose.connection.close();
    }
  });
  return count;
};

const updateCfHandle = async (discordUserId, cfHandle) => {
  await mongo().then(async (mongoose) => {
    try {
      await User.findOneAndUpdate({ discordId: discordUserId }, { cfHandle });
    } finally {
      mongoose.connection.close();
    }
  });
};

const updateBatch = async (discordUserId, batch) => {
  batch = Number(batch);
  await mongo().then(async (mongoose) => {
    try {
      await User.findOneAndUpdate({ discordId: discordUserId }, { batch });
    } finally {
      mongoose.connection.close();
    }
  });
};

const existsInUsers = async (discordUserId) => {
  let exists = false;

  await mongo().then(async (mongoose) => {
    try {
      await User.findOne({ discordId: discordUserId }, (err, doc) => {
        if (doc !== null) exists = true;
      });
    } finally {
      mongoose.connection.close();
    }
  });

  return exists;
};

const remove = async (discordUserId) => {
  await mongo().then(async (mongoose) => {
    try {
      await User.findOneAndDelete({ discordId: discordUserId });
    } finally {
      mongoose.connection.close();
    }
  });
};

module.exports = {
  add,
  updateFailCount,
  updateCfHandle,
  updateBatch,
  existsInUsers,
  remove,
};
