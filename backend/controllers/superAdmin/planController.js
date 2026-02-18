const Plan = require("../../models/Plan");

exports.createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
