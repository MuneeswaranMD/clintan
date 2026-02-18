const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Models
const Module = require('../models/Module');
const Industry = require('../models/Industry');
const Tenant = require('../models/Tenant');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Clear existing Modules and Industries (Optional: comment out if you want to keep existing)
        await Module.deleteMany({});
        await Industry.deleteMany({});
        console.log('🧹 Cleared existing Modules and Industries');

        // 2. Define Core Modules (Universal for everyone)
        const coreModules = [
            {
                key: 'sa_dashboard',
                name: 'Control Center',
                path: '/super/dashboard',
                icon: 'Shield',
                type: 'core',
                category: 'super_admin',
                order: -10,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_tenants',
                name: 'Tenants',
                path: '/super/tenants',
                icon: 'Users',
                type: 'core',
                category: 'super_admin',
                order: -9,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_industries',
                name: 'Industries',
                path: '/super/industries',
                icon: 'Briefcase',
                type: 'core',
                category: 'super_admin',
                order: -8,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_plans',
                name: 'Subscription Plans',
                path: '/super/plans',
                icon: 'CreditCard',
                type: 'core',
                category: 'super_admin',
                order: -7,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_revenue',
                name: 'Revenue & Billing',
                path: '/super/revenue',
                icon: 'TrendingUp',
                type: 'core',
                category: 'super_admin',
                order: -6,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_users',
                name: 'Platform Users',
                path: '/super/users',
                icon: 'User',
                type: 'core',
                category: 'super_admin',
                order: -5,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_analytics',
                name: 'Analytics',
                path: '/super/analytics',
                icon: 'BarChart3',
                type: 'core',
                category: 'super_admin',
                order: -4,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_modules',
                name: 'Modules',
                path: '/super/modules',
                icon: 'Package',
                type: 'core',
                category: 'super_admin',
                order: -3,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_feature_flags',
                name: 'Feature Flags',
                path: '/super/feature-flags',
                icon: 'Flag',
                type: 'core',
                category: 'super_admin',
                order: -2,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_settings',
                name: 'System Settings',
                path: '/super/settings',
                icon: 'Settings',
                type: 'core',
                category: 'super_admin',
                order: -1,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_notifications',
                name: 'Notifications',
                path: '/super/notifications',
                icon: 'Bell',
                type: 'core',
                category: 'super_admin',
                order: 100,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_branches',
                name: 'Branch Monitoring',
                path: '/super/branches',
                icon: 'MapPin',
                type: 'core',
                category: 'super_admin',
                order: 101,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_comms',
                name: 'Communication',
                path: '/super/comms',
                icon: 'MessageSquare',
                type: 'core',
                category: 'super_admin',
                order: 102,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_growth',
                name: 'Growth Tools',
                path: '/super/growth',
                icon: 'TrendingUp',
                type: 'core',
                category: 'super_admin',
                order: 103,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_infra',
                name: 'Infra & DB',
                path: '/super/infra',
                icon: 'Database',
                type: 'core',
                category: 'super_admin',
                order: 104,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_automation',
                name: 'Automation',
                path: '/super/automation',
                icon: 'Zap',
                type: 'core',
                category: 'super_admin',
                order: 105,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_logs',
                name: 'Logs & Monitoring',
                path: '/super/logs',
                icon: 'Activity',
                type: 'core',
                category: 'super_admin',
                order: 106,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'dashboard',
                name: 'Dashboard',
                path: '/dashboard',
                icon: 'LayoutDashboard',
                type: 'core',
                category: 'core',
                order: 0,
                rolesAllowed: ['admin', 'staff', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'crm',
                name: 'CRM',
                path: '/crm',
                icon: 'Users',
                type: 'core',
                category: 'sales',
                order: 1,
                rolesAllowed: ['admin', 'sales', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'estimates',
                name: 'Estimates',
                path: '/estimates',
                icon: 'FileText',
                type: 'core',
                category: 'sales',
                order: 2,
                rolesAllowed: ['admin', 'sales', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'invoices',
                name: 'Invoices',
                path: '/invoices',
                icon: 'Receipt',
                type: 'core',
                category: 'finance',
                order: 3,
                rolesAllowed: ['admin', 'accountant', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'settings',
                name: 'Settings',
                path: '/settings',
                icon: 'Settings',
                type: 'core',
                category: 'settings',
                order: 99,
                rolesAllowed: ['admin', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'sa_companies',
                name: 'Companies',
                path: '/companies',
                icon: 'Building2',
                type: 'core',
                category: 'super_admin',
                order: -9,
                rolesAllowed: ['superadmin']
            },
            {
                key: 'sa_config',
                name: 'SaaS Config',
                path: '/saas-config',
                icon: 'Settings',
                type: 'core',
                category: 'super_admin',
                order: -8,
                rolesAllowed: ['superadmin']
            }
        ];

        // 3. Define Extensive Modules (Use case specific)
        const extensionModules = [
            {
                key: 'projects',
                name: 'Projects',
                path: '/projects',
                icon: 'Briefcase',
                type: 'extension',
                category: 'operations',
                order: 4,
                rolesAllowed: ['admin', 'staff', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'expenses',
                name: 'Expenses',
                path: '/expenses',
                icon: 'DollarSign',
                type: 'extension',
                category: 'finance',
                order: 5,
                rolesAllowed: ['admin', 'accountant', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'inventory',
                name: 'Inventory',
                path: '/inventory',
                icon: 'Package',
                type: 'extension',
                category: 'operations',
                order: 4,
                rolesAllowed: ['admin', 'staff', 'warehouse', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'pos',
                name: 'Point of Sale',
                path: '/pos',
                icon: 'ShoppingCart',
                type: 'extension',
                category: 'sales',
                order: 5,
                rolesAllowed: ['admin', 'sales', 'superadmin', 'COMPANY_ADMIN']
            },
            {
                key: 'appointments',
                name: 'Appointments',
                path: '/appointments',
                icon: 'Calendar',
                type: 'extension',
                category: 'operations',
                order: 4,
                rolesAllowed: ['admin', 'staff', 'superadmin', 'COMPANY_ADMIN']
            }
        ];

        await Module.insertMany([...coreModules, ...extensionModules]);
        console.log(`✅ Seeded ${coreModules.length + extensionModules.length} Modules`);

        // 4. Define Industries

        // Industry: Freelancer (Needs Projects, Expenses)
        const freelancerIndustry = {
            key: 'freelancer',
            name: 'Freelancer / Agency',
            extensions: ['projects', 'expenses']
        };

        // Industry: Retail (Needs Inventory, POS)
        const retailIndustry = {
            key: 'retail',
            name: 'Retail Store',
            extensions: ['inventory', 'pos']
        };

        // Industry: Clinic (Needs Appointments)
        const clinicIndustry = {
            key: 'clinic',
            name: 'Healthcare Clinic',
            extensions: ['appointments']
        };

        await Industry.insertMany([freelancerIndustry, retailIndustry, clinicIndustry]);
        console.log('✅ Seeded 3 Industries');

        console.log('🚀 Database Seeding Complete');
        process.exit();

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
