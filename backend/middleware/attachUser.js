const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    if (!req.firebaseUser) {
        return res.status(401).json({ message: "Unauthorized - No Firebase User" });
    }
    
    const firebaseUid = req.firebaseUser.uid;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found in system" });
    }

    req.user = user;
    // Ensure tenantId matches if passed in headers (double check)
    if (req.headers["x-tenant-id"] && user.tenantId.toString() !== req.headers["x-tenant-id"]) {
         // Use the user's tenantId as the source of truth
         req.tenantId = user.tenantId.toString();
    } else {
         req.tenantId = user.tenantId.toString();
    }
    
    next();
  } catch (error) {
    console.error("Attach User Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
