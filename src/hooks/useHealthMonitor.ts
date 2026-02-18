import { useEffect, useState } from "react";
import { automationService } from "../services/automationService";

export function useHealthMonitor() {
    const [status, setStatus] = useState<"checking" | "online" | "slow" | "offline">("checking");
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [officialStats, setOfficialStats] = useState<{ uptime: string; avgResponseTime: string } | null>(null);
    const [uptimeStats, setUptimeStats] = useState({
        success: 0,
        failure: 0
    });

    useEffect(() => {
        const checkHealth = async () => {
            const start = performance.now();
            const backendUrl = automationService.getBackendUrl();

            try {
                const res = await fetch(`${backendUrl}/api/health`, {
                    signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
                });

                const data = await res.json();
                const end = performance.now();
                const time = end - start;

                setResponseTime(time);
                if (data.stats) {
                    setOfficialStats(data.stats);
                }

                if (!res.ok || time > 2000) {
                    setStatus("slow");
                    setUptimeStats(prev => ({
                        ...prev,
                        failure: prev.failure + 1
                    }));
                } else {
                    setStatus("online");
                    setUptimeStats(prev => ({
                        ...prev,
                        success: prev.success + 1
                    }));
                }
            } catch (error) {
                setStatus("offline");
                setResponseTime(null);
                setUptimeStats(prev => ({
                    ...prev,
                    failure: prev.failure + 1
                }));
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);

        return () => clearInterval(interval);
    }, []);

    const total = uptimeStats.success + uptimeStats.failure;
    const localUptime =
        total === 0
            ? "100.00"
            : ((uptimeStats.success / total) * 100).toFixed(2);

    return {
        status,
        responseTime,
        uptimePercentage: officialStats?.uptime || localUptime
    };
}
