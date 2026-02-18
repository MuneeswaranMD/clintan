const User = require("../../models/User");

exports.getPlatformUsers = async (req, res) => {
  try {
    const users = await User.find().populate("tenantId", "name"); // populate tenant name
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
