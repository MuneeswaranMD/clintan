const HealthLog = require('../models/HealthLog');

class HealthService {
    async logHeartbeat(responseTime, status) {
        try {
            // Only log if it's a significant event or periodically
            // Here we just log every request for simplicity in this V1
            await HealthLog.create({
                responseTime,
                status,
                nodeUrl: process.env.RENDER_EXTERNAL_URL || 'localhost'
            });
        } catch (error) {
            console.error('Failed to log health heartbeat:', error);
        }
    }

    async getWeeklyStats() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const logs = await HealthLog.find({
                timestamp: { $gte: sevenDaysAgo }
            }).lean();

            if (logs.length === 0) return { uptime: 100, avgResponseTime: 0 };

            const successful = logs.filter(l => l.status === 'online').length;
            const uptime = (successful / logs.length) * 100;
            const avgResponseTime = logs.reduce((acc, l) => acc + l.responseTime, 0) / logs.length;

            return {
                uptime: uptime.toFixed(2),
                avgResponseTime: avgResponseTime.toFixed(0),
                totalChecks: logs.length
            };
        } catch (error) {
            console.error('Failed to get health stats:', error);
            return null;
        }
    }
}

module.exports = new HealthService();
