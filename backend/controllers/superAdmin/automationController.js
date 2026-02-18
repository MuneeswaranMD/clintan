const Automation = require("../../models/Automation");

exports.getAutomationRules = async (req, res) => {
  try {
    const rules = await Automation.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
