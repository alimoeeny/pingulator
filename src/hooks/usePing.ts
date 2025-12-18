import { useState, useCallback, useRef } from 'react';

export interface PingResult {
    latency: number;
    timestamp: number;
}

export interface UsePingReturn {
    latencies: number[];
    median: number | null;
    status: 'idle' | 'running' | 'stopped';
    ping: () => Promise<void>;
    start: (iterations?: number) => void;
    stop: () => void;
}

export const usePing = (url: string, group: string) => {
    const [latencies, setLatencies] = useState<number[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
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
        /*
          For non-GCP, we use no-cors.
          For GCP, we use 'cors' if we want to read the body (for global proxy check),
          but for pure latency, 'no-cors' is faster and less error prone if headers are missing.
          However, the original app appends /api/ping for GCP.
        */
        const targetUrl = isGCP ? `${url}/api/ping` : url;
        const mode: RequestMode = isGCP ? 'cors' : 'no-cors';

        try {
            await fetch(targetUrl, {
                mode,
                cache: 'no-cache',
                // invalid credentials to prevent auth dialogs? or just omit
            });
            const end = performance.now();
            return end - start;
        } catch (e) {
            console.error(`Ping failed for ${url}`, e);
            return null;
        }
    };

    const start = useCallback(async (iterations = 10) => {
        setLatencies([]);
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
        ping: pingOnce,
        start,
        stop
    };
};
