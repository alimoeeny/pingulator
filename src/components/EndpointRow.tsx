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
    const { median, start, stop } = usePing(endpoint.url, endpoint.group || 'GCP');

    useImperativeHandle(ref, () => ({
        start: () => start(10),
        stop
    }));

    useEffect(() => {
        onMedianUpdate(endpoint.id, median);
    }, [median, endpoint.id]);

    return (
        <tr className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${isFastest ? 'bg-green-50 hover:bg-green-100' : ''}`}>
            <td className="py-3 px-4 text-sm text-gray-700">
                <span className="font-medium">{endpoint.label}</span>
                <span className="block text-xs text-gray-400 mt-0.5 md:hidden">{endpoint.id}</span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell font-mono text-xs">
                {endpoint.id}
            </td>
            <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">
                {median ? `${Math.round(median)} ms` : <span className="text-gray-300">-</span>}
            </td>
        </tr>
    );
});
