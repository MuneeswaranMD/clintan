const Module = require("../../models/Module");

exports.createModule = async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
