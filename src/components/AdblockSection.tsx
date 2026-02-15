import { useState, useCallback } from "react";
import { AdblockRow } from "./AdblockRow";
import type { AdblockRowRef } from "./AdblockRow";
import type { Endpoint } from "../types";

interface Props {
  endpoints: Endpoint[];
  rowRefs: React.MutableRefObject<Record<string, AdblockRowRef | null>>;
}

export const AdblockSection = ({ endpoints, rowRefs }: Props) => {
  const [results, setResults] = useState<Record<string, boolean | null>>({});

  const handleStatusUpdate = useCallback((id: string, blocked: boolean | null) => {
    setResults(prev => ({ ...prev, [id]: blocked }));
  }, []);

  const total = endpoints.length;
  const reported = Object.values(results).filter(v => v !== null).length;
  const blockedCount = Object.values(results).filter(v => v === true).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden transition-all hover:shadow-md">
      {/* Group Header */}
      <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-16 z-10 supports-[backdrop-filter]:bg-slate-50/60">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Adblock Check</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {total}
          </span>
        </div>

        {/* Summary Badge */}
        {reported > 0 && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              blockedCount === total
                ? "bg-emerald-100 text-emerald-800"
                : blockedCount === 0
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {blockedCount}/{total} Blocked
          </span>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-6 w-1/2">Domain</th>
            <th className="py-4 px-6 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map(endpoint => (
            <AdblockRow
              key={endpoint.id}
              endpoint={endpoint}
              onStatusUpdate={handleStatusUpdate}
              ref={el => { rowRefs.current[endpoint.id] = el; }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
