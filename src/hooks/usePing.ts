import { useState, useCallback, useRef } from 'react';

export interface PingResult {
    latency: number;
    timestamp: number;
}

export interface UsePingReturn {
    latencies: number[];
    median: number | null;
    status: 'idle' | 'running' | 'stopped';
    completedIterations: number;
    hasNetworkError: boolean;
    ping: () => Promise<void>;
    start: (iterations?: number) => void;
    stop: () => void;
}

export const usePing = (url: string, group: string) => {
    const [latencies, setLatencies] = useState<number[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
    const [completedIterations, setCompletedIterations] = useState(0);
    const [hasNetworkError, setHasNetworkError] = useState(false);
    const stopRef = useRef(false);

    const calculateMedian = (arr: number[]) => {
        if (arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const pingOnce = async () => {
        const start = performance.now();
        const isGCP = group === 'GCP';

        // Use the URL as-is for non-GCP, append /api/ping for GCP
        const targetUrl = isGCP ? `${url}/api/ping` : url;

        // Use no-cors mode to avoid CORS issues
        // Note: Cannot read HTTP status codes in no-cors mode
        const mode: RequestMode = 'no-cors';

        try {
            await fetch(targetUrl, {
                mode,
                cache: 'no-cache',
            });

            // In no-cors mode, if fetch completes, the network request succeeded
            // (even if HTTP status was 404, 500, etc - we can't tell)
            const end = performance.now();
            return end - start;
        } catch (e) {
            // Network error (DNS failure, connection timeout, etc)
            console.error(`Network error for ${url}`, e);
            setHasNetworkError(true);
            return null;
        }
    };

    const start = useCallback(async (iterations = 10) => {
        setLatencies([]);
        setCompletedIterations(0);
        setHasNetworkError(false);
        setStatus('running');
        stopRef.current = false;

        for (let i = 0; i < iterations; i++) {
            if (stopRef.current) break;
            const latency = await pingOnce();
            if (latency !== null) {
                setLatencies(prev => {
                    const next = [...prev, latency];
                    return next;
                });
            }
            setCompletedIterations(prev => prev + 1);
            // Small delay to prevent freezing/choking
            await new Promise(r => setTimeout(r, 100));
        }
        setStatus('stopped');
    }, [url, group]);

    const stop = useCallback(() => {
        stopRef.current = true;
        setStatus('stopped');
    }, []);

    return {
        latencies,
        median: calculateMedian(latencies),
        status,
        completedIterations,
        hasNetworkError,
        ping: pingOnce,
        start,
        stop
    };
};
