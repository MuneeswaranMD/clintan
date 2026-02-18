const mongoose = require("mongoose");

exports.getDBStats = async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
