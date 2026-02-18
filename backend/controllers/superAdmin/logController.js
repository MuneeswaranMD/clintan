const SystemLog = require("../../models/SystemLog");

exports.getLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
