import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { usePing } from "../hooks/usePing";
import type { Endpoint } from "../types";

interface Props {
  endpoint: Endpoint;
  onStatusUpdate: (id: string, blocked: boolean | null) => void;
}

export interface AdblockRowRef {
  start: () => void;
  stop: () => void;
}

export const AdblockRow = forwardRef<AdblockRowRef, Props>(
  ({ endpoint, onStatusUpdate }, ref) => {
    const {
      start,
      stop,
      status,
      hasNetworkError,
      completedIterations,
    } = usePing(endpoint.url, endpoint.group || "Adblock Check");

    useImperativeHandle(ref, () => ({
      start: () => start(1),
      stop,
    }));

    const reportedRef = useRef(false);

    const isRunning = status === "running";
    const isDone = status === "stopped" && completedIterations > 0;
    const isBlocked = isDone && hasNetworkError;
    const isNotBlocked = isDone && !hasNetworkError;

    useEffect(() => {
      if (isRunning) {
        reportedRef.current = false;
      }
    }, [isRunning]);

    useEffect(() => {
      if (isDone && !reportedRef.current) {
        reportedRef.current = true;
        onStatusUpdate(endpoint.id, hasNetworkError);
      }
    }, [isDone, hasNetworkError, endpoint.id]);

    return (
      <tr className="border-b border-gray-100 last:border-0 transition-colors duration-200">
        {/* Domain Label */}
        <td className="py-3 px-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">
              {endpoint.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {new URL(endpoint.url).hostname}
            </span>
          </div>
        </td>

        {/* Status Badge */}
        <td className="py-3 px-6 text-right">
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Checking…
            </span>
          ) : isBlocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Blocked
            </span>
          ) : isNotBlocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Not Blocked
            </span>
          ) : (
            <span className="text-slate-300 text-sm font-medium">—</span>
          )}
        </td>
      </tr>
    );
  },
);
