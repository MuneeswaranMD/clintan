const Industry = require("../../models/Industry");

exports.createIndustry = async (req, res) => {
  try {
    const industry = new Industry(req.body);
    await industry.save();
    res.json(industry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIndustries = async (req, res) => {
  try {
    const industries = await Industry.find();
    res.json(industries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
