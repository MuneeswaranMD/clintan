const express = require('express');
const router = express.Router();

// Placeholder for future automation endpoints
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Automation API is running'
  });
});

module.exports = router;
