const express = require('express');
const router = express.Router();

// Middleware
const superAdmin = require('../middleware/superAdmin'); // Ensures user is Super Admin
const firebaseAuth = require("../middleware/firebaseAuth");
const attachUser = require("../middleware/attachUser");

// Controllers
const dashboardController = require('../controllers/superAdmin/dashboardController');
const tenantController = require('../controllers/superAdmin/tenantController');
const industryController = require('../controllers/superAdmin/industryController');
const moduleController = require('../controllers/superAdmin/moduleController');
const planController = require('../controllers/superAdmin/planController');
const revenueController = require('../controllers/superAdmin/revenueController');
const userController = require('../controllers/superAdmin/userController');
const featureController = require('../controllers/superAdmin/featureController');
const notificationController = require('../controllers/superAdmin/notificationController');
const logController = require('../controllers/superAdmin/logController');
const automationController = require('../controllers/superAdmin/automationController');
const infraController = require('../controllers/superAdmin/infraController');

// Apply Middleware globally for this router
router.use(firebaseAuth);
router.use(attachUser);
router.use(superAdmin);

// Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Tenants
router.get('/tenants', tenantController.getAllTenants);
router.put('/tenants/:id/suspend', tenantController.suspendTenant);
router.put('/tenants/:id/activate', tenantController.activateTenant);

// Industries
router.get('/industries', industryController.getIndustries);
router.post('/industries', industryController.createIndustry);

// Modules
router.get('/modules', moduleController.getModules);
router.post('/modules', moduleController.createModule);
// Note: menuRoutes.js also has module CRUD, consider consolidating later.

// Plans
router.get('/plans', planController.getPlans);
router.post('/plans', planController.createPlan);

// Revenue
router.get('/revenue', revenueController.getRevenueReport);

// Platform Users
router.get('/users', userController.getPlatformUsers);

// Feature Flags
router.get('/features', featureController.getFeatures);
router.post('/features/toggle', featureController.toggleFeature);

// Notifications
router.get('/notifications', notificationController.getNotifications);

// Logs
router.get('/logs', logController.getLogs);

// Automation
router.get('/automation', automationController.getAutomationRules);

// Infrastructure
router.get('/infra/db', infraController.getDBStats);

module.exports = router;
