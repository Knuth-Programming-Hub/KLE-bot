const mongo = require("../mongo");
const User = require("../models/discord-member.model");

const add = async (discordUserId) => {
  await mongo().then(async (mongoose) => {
    try {
      const newUser = new User({
        _id: discordUserId,
        failCount: 0,
        isMember: true,
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
      await User.findById(discordUserId, (err, doc) => {
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
      await User.findByIdAndUpdate(discordUserId, { failCount: count });
    } finally {
      mongoose.connection.close();
    }
  });
  return count;
};

const updateCfHandle = async (discordUserId, cfHandle) => {
  await mongo().then(async (mongoose) => {
    try {
      await User.findByIdAndUpdate(discordUserId, { cfHandle });
    } finally {
      mongoose.connection.close();
    }
  });
};

const updateBatch = async (discordUserId, batch) => {
  batch = Number(batch);
  await mongo().then(async (mongoose) => {
    try {
      await User.findByIdAndUpdate(discordUserId, { batch });
    } finally {
      mongoose.connection.close();
    }
  });
};

const existsInUsers = async (discordUserId) => {
  let exists = false;

  await mongo().then(async (mongoose) => {
    try {
      await User.findById(discordUserId, (err, doc) => {
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
      await User.findByIdAndDelete({ _id: discordUserId });
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
