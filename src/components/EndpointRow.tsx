import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { usePing } from '../hooks/usePing';
import type { Endpoint } from '../types';

interface Props {
    endpoint: Endpoint;
    isFastest: boolean;
    onMedianUpdate: (id: string, median: number | null) => void;
}

export interface EndpointRowRef {
    start: () => void;
    stop: () => void;
}

export const EndpointRow = forwardRef<EndpointRowRef, Props>(({ endpoint, isFastest, onMedianUpdate }, ref) => {
    const { median, start, stop, completedIterations, status, hasNetworkError } = usePing(endpoint.url, endpoint.group || 'GCP');

    useImperativeHandle(ref, () => ({
        start: () => start(10),
        stop
    }));

    useEffect(() => {
        onMedianUpdate(endpoint.id, median);
    }, [median, endpoint.id]);

    const isRunning = status === 'running';

    return (
        <tr className={`
            border-b border-gray-100 last:border-0 transition-colors duration-200
            ${hasNetworkError ? 'bg-red-50/40 hover:bg-red-100/40' :
                isFastest ? 'bg-emerald-50/60 hover:bg-emerald-100/60' : 'hover:bg-slate-50'}
        `}>
            {/* Location Label */}
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-2 h-2 rounded-full shrink-0 transition-all duration-500
                        ${hasNetworkError ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                            isFastest ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                isRunning ? 'bg-indigo-400 animate-pulse' : 'bg-slate-300'}
                    `} />
                    <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isFastest ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {endpoint.label}
                        </span>

                        {/* Mobile ID */}
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 md:hidden">
                            {endpoint.id}
                        </span>

                        {/* Progress Bar (Visible only when running) */}
                        <div className={`
                            h-1 bg-slate-100 rounded-full mt-2 w-24 overflow-hidden transition-opacity duration-300
                            ${isRunning ? 'opacity-100' : 'opacity-0 h-0 mt-0'}
                        `}>
                            <div
                                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                style={{ width: `${(completedIterations / 10) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </td>

            {/* Region ID (Desktop) */}
            <td className="py-4 px-6 hidden md:table-cell">
                <code className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">
                    {endpoint.id}
                </code>
            </td>

            {/* Latency Metric */}
            <td className="py-4 px-6 text-right">
                <div className="flex flex-col items-end gap-1">
                    {hasNetworkError ? (
                        <span className="text-sm font-semibold text-red-600">NETWORK ERROR</span>
                    ) : median ? (
                        <div className="flex items-baseline gap-1">
                            <span className={`text-lg font-bold tabular-nums tracking-tight ${isFastest ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {Math.round(median)}
                            </span>
                            <span className={`text-xs font-medium ${isFastest ? 'text-emerald-500' : 'text-slate-400'}`}>ms</span>
                        </div>
                    ) : (
                        <span className="text-slate-300 text-sm font-medium">--</span>
                    )}

                    {/* Iteration Count */}
                    <div className={`text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300
                        ${isRunning ? 'text-indigo-500' : 'text-slate-300'}
                    `}>
                        {isRunning ? `Ping ${completedIterations}/10` :
                            completedIterations === 10 ? 'Done' : 'Idle'}
                    </div>
                </div>
            </td>
        </tr>
    );
});
