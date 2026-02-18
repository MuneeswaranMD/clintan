const FeatureFlag = require("../../models/FeatureFlag");

exports.getFeatures = async (req, res) => {
    try {
        const features = await FeatureFlag.find();
        res.json(features);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleFeature = async (req, res) => {
    try {
        const { key } = req.body;
        const feature = await FeatureFlag.findOne({ key });
        if (!feature) {
            // Create if doesn't exist? Or 404. Let's create for flexibility
             const newFeature = new FeatureFlag({ key, enabled: true });
             await newFeature.save();
             return res.json(newFeature);
        }
        feature.enabled = !feature.enabled;
        await feature.save();
        res.json(feature);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
